package cors

import (
	"net/http"
	"os"
	"strings"
)

var defaultAllowed = []string{
	"https://fastpin.uz",
	"https://www.fastpin.uz",
	"http://fastpin.uz",
	"http://www.fastpin.uz",
	"https://new.fastpin.uz",
	"http://new.fastpin.uz",
}

var allowedOrigins = func() map[string]bool {
	m := map[string]bool{}
	for _, o := range defaultAllowed {
		m[o] = true
	}
	if extra := os.Getenv("ALLOWED_ORIGINS"); extra != "" {
		for _, o := range strings.Split(extra, ",") {
			o = strings.TrimSpace(o)
			if o != "" {
				m[o] = true
			}
		}
	}
	return m
}()

func Cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
