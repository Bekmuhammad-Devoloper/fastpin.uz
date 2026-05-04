package middleware

import (
	"context"
	"demo/almaz/internal/auth"
	jwtpkg "demo/almaz/pkg/jwt"
	"demo/almaz/pkg/ctxkeys"
	"demo/almaz/pkg/res"
	"net/http"
	"strings"
)

func Auth(secret string, repo *auth.AuthRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractBearer(r)
			if tokenStr == "" {
				res.Json(w, "missing authorization token", http.StatusUnauthorized)
				return
			}

			claims, err := jwtpkg.Parse(tokenStr, secret)
			if err != nil {
				res.Json(w, "invalid or expired token", http.StatusUnauthorized)
				return
			}

			var user auth.User
			if err := repo.DataBase.Where("token = ?", claims.UserID).First(&user).Error; err != nil {
				res.Json(w, "user not found", http.StatusUnauthorized)
				return
			}

			if user.UserRole != claims.Role {
				res.Json(w, "token is outdated, please re-login", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ctxkeys.UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := UserFromContext(r.Context())
		if !ok {
			res.Json(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		if user.UserRole != "admin" && user.UserRole != "superUser" {
			res.Json(w, "you are not admin", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func UserFromContext(ctx context.Context) (auth.User, bool) {
	user, ok := ctx.Value(ctxkeys.UserContextKey).(auth.User)
	return user, ok
}

func extractBearer(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if h != "" {
		return strings.TrimPrefix(h, "Bearer ")
	}
	return r.FormValue("token")
}
