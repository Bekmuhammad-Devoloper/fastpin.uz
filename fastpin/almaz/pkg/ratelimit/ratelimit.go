package ratelimit

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

const (
	MaxAttempts   = 5
	BlockDuration = 15 * time.Minute
)

type entry struct {
	attempts     int
	blockedUntil time.Time
}

type LoginLimiter struct {
	mu      sync.Mutex
	entries map[string]*entry
}

func NewLoginLimiter() *LoginLimiter {
	l := &LoginLimiter{
		entries: make(map[string]*entry),
	}
	go l.cleanup()
	return l
}

func (l *LoginLimiter) IsBlocked(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	e, ok := l.entries[ip]
	if !ok {
		return false
	}
	return time.Now().Before(e.blockedUntil)
}

func (l *LoginLimiter) RecordFailure(ip string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	e, ok := l.entries[ip]
	if !ok {
		e = &entry{}
		l.entries[ip] = e
	}
	if !e.blockedUntil.IsZero() && time.Now().After(e.blockedUntil) {
		e.attempts = 0
		e.blockedUntil = time.Time{}
	}
	e.attempts++
	if e.attempts >= MaxAttempts {
		e.blockedUntil = time.Now().Add(BlockDuration)
	}
}

func (l *LoginLimiter) Reset(ip string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.entries, ip)
}

func GetIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		ip := strings.TrimSpace(parts[0])
		if net.ParseIP(ip) != nil {
			return ip
		}
	}
	if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
		if net.ParseIP(realIP) != nil {
			return realIP
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (l *LoginLimiter) cleanup() {
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		l.mu.Lock()
		now := time.Now()
		for ip, e := range l.entries {
			if now.After(e.blockedUntil.Add(time.Hour)) && e.attempts < MaxAttempts {
				delete(l.entries, ip)
			} else if now.After(e.blockedUntil.Add(time.Hour)) {
				delete(l.entries, ip)
			}
		}
		l.mu.Unlock()
	}
}
