package auth

import (
	"demo/almaz/pkg/ctxkeys"
	"demo/almaz/pkg/db"
	jwtpkg "demo/almaz/pkg/jwt"
	"demo/almaz/pkg/ratelimit"
	"demo/almaz/pkg/req"
	"demo/almaz/pkg/res"
	"demo/almaz/pkg/token"
	"errors"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewUserRepository(dataBase *db.Db) *AuthRepository {
	return &AuthRepository{
		DataBase: dataBase,
	}
}
func NewAuthHandler(router *http.ServeMux, deps AuthhandlerDeps) *AuthHandler {
	handler := &AuthHandler{
		Config:         deps.Config,
		AuthRepository: *deps.AuthRepository,
		Limiter:        ratelimit.NewLoginLimiter(),
	}
	router.HandleFunc("/users/login", handler.login())
	router.HandleFunc("/users/register", handler.register())
	router.HandleFunc("/users/refresh", handler.refresh())
	router.Handle("/users/me", deps.AuthMW(http.HandlerFunc(handler.me())))
	router.Handle("/users/getUserById", deps.AuthMW(http.HandlerFunc(handler.getUserById())))
	router.Handle("/users/getUsers", deps.AdminMW(http.HandlerFunc(handler.getUsers())))
	router.Handle("/users/updateUser", deps.AdminMW(http.HandlerFunc(handler.update())))
	router.Handle("/users/deleteUser", deps.AdminMW(http.HandlerFunc(handler.deleteUser())))
	router.Handle("/users/changePassword", deps.AdminMW(http.HandlerFunc(handler.changePassword())))
	return handler
}
func (handler *AuthHandler) IsAdminToken(userToken string) bool {
	user, err := handler.GetUserByToken(userToken)
	if err != nil {
		return false
	}
	return user.UserRole == "admin"
}
func (handler *AuthHandler) GetUserByToken(token string) (User, error) {
	var user User
	err := handler.AuthRepository.DataBase.Where("token = ?", token).First(&user).Error
	if err != nil {
		return user, errors.New("user is not found")
	}
	return user, nil
}
func (handler *AuthHandler) UpdateBalance(token string, newPrice int) (User, error) {
	var user User
	res := handler.AuthRepository.DataBase.
		Model(&User{}).
		Where("token = ?", token).
		Update("balance", gorm.Expr("balance + ?", newPrice))
	if res.Error != nil {
		return user, res.Error
	}
	if res.RowsAffected == 0 {
		return user, errors.New("user is not found")
	}
	return user, nil
}

// UpdateBalanceTx credits/debits a user's balance inside the caller's DB
// transaction so the change is atomic with the surrounding ledger writes.
// It fails (and thus rolls the caller's tx back) when no user row matches.
func (handler *AuthHandler) UpdateBalanceTx(tx *gorm.DB, token string, amount int) error {
	res := tx.
		Model(&User{}).
		Where("token = ?", token).
		Update("balance", gorm.Expr("balance + ?", amount))
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("user is not found")
	}
	return nil
}
func (handler *AuthHandler) DecreaseBalance(tx *gorm.DB, userToken string, price int) error {
	var user User
	if err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("token = ?", userToken).
		First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("пользователь не найден")
		}
		return err
	}

	if user.Balance < price {
		return errors.New("недостаточно средств")
	}

	return tx.
		Model(&User{}).
		Where("token = ?", userToken).
		Update("balance", gorm.Expr("balance - ?", price)).Error
}
func (handler *AuthHandler) login() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := ratelimit.GetIP(r)
		if handler.Limiter.IsBlocked(ip) {
			res.Json(w, "too many failed attempts, try again in 15 minutes", 429)
			return
		}

		body, err := req.HandleBody[LoginRequest](&w, r)
		if err != nil {
			return
		}
		loginKey := "login:" + body.Login
		if handler.Limiter.IsBlocked(loginKey) {
			res.Json(w, "too many failed attempts, try again in 15 minutes", 429)
			return
		}

		var user User
		err = handler.AuthRepository.DataBase.Where("login = ?", body.Login).First(&user).Error
		if err != nil {
			handler.Limiter.RecordFailure(ip)
			handler.Limiter.RecordFailure(loginKey)
			res.Json(w, "user is not found", 400)
			return
		}
		if strings.HasPrefix(user.Password, "$2a$") || strings.HasPrefix(user.Password, "$2b$") {
			if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
				handler.Limiter.RecordFailure(ip)
				handler.Limiter.RecordFailure(loginKey)
				res.Json(w, "password is not correct", 401)
				return
			}
		} else {
			if user.Password != body.Password {
				handler.Limiter.RecordFailure(ip)
				handler.Limiter.RecordFailure(loginKey)
				res.Json(w, "password is not correct", 401)
				return
			}
			hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 12)
			if err == nil {
				handler.AuthRepository.DataBase.Model(&User{}).
					Where("login = ?", body.Login).
					Update("password", string(hash))
				user.Password = string(hash)
			}
		}
		handler.Limiter.Reset(ip)
		handler.Limiter.Reset("login:" + body.Login)
		pair, err := jwtpkg.NewPair(user.Token, user.UserRole, handler.Config.JWTSecret)
		if err != nil {
			res.Json(w, "token generation failed", 500)
			return
		}
		res.Json(w, pair, 200)
	}
}
func (handler *AuthHandler) getUsers() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[GetUsersRequest](&w, r)
		if err != nil {
			return
		}

		page := body.Page
		if page < 1 {
			page = 1
		}

		count := body.Count
		if count < 1 {
			count = 10
		}
		if count > 100 {
			count = 100
		}

		offset := (page - 1) * count

		query := handler.AuthRepository.DataBase.Model(&User{})
		if body.Login != nil && *body.Login != "" {
			query = query.Where(
				"login ILIKE ?",
				"%"+*body.Login+"%",
			)
		}
		if body.Token != nil && *body.Token != "" {
			val := "%" + *body.Token + "%"
			query = query.Where(
				"(login ILIKE ? OR token ILIKE ?)",
				val,
				val,
			)
		}
		if body.StartBalance != nil {
			query = query.Where(
				"balance >= ?",
				*body.StartBalance,
			)
		}
		if body.UserRole != nil && *body.UserRole != "" {
			query = query.Where(
				"user_role = ?",
				*body.UserRole,
			)
		}

		var total int64
		if err := query.Count(&total).Error; err != nil {
			res.Json(w, "ошибка при подсчёте пользователей", 500)
			return
		}
		var users []User
		if err := query.
			Offset(offset).
			Limit(count).
			Find(&users).
			Error; err != nil {
			res.Json(w, "ошибка при получении пользователей", 500)
			return
		}

		safeUsers := make([]AdminUserResponse, len(users))
		for i, u := range users {
			safeUsers[i] = toAdminUserResponse(u)
		}
		res.Json(w, map[string]interface{}{
			"users": safeUsers,
			"total": total,
			"page":  page,
			"count": count,
			"pages": (total + int64(count) - 1) / int64(count),
		}, 200)
	}
}
func (handler *AuthHandler) update() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[UpdateUserRequest](&w, r)
		if err != nil {
			return
		}

		var user User
		if err := handler.AuthRepository.DataBase.
			Where("token = ?", body.UserId).
			First(&user).Error; err != nil {
			res.Json(w, "user is not found", 404)
			return
		}

		user.UserRole = body.UserRole

		if err := handler.AuthRepository.DataBase.
			Model(&User{}).
			Where("token = ?", body.UserId).
			Update("user_role", body.UserRole).
			Error; err != nil {
			res.Json(w, "failed to update user", 500)
			return
		}

		res.Json(w, toAdminUserResponse(user), 200)
	}
}

func (handler *AuthHandler) getUserById() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		requester, ok := r.Context().Value(ctxkeys.UserContextKey).(User)
		if !ok {
			res.Json(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		body, err := req.HandleBody[GetBalanceRequest](&w, r)
		if err != nil {
			return
		}
		if requester.UserRole != "admin" && requester.UserRole != "superUser" && requester.Token != body.UserId {
			res.Json(w, "forbidden", http.StatusForbidden)
			return
		}
		var user User
		if err := handler.AuthRepository.DataBase.Where("token = ?", body.UserId).First(&user).Error; err != nil {
			res.Json(w, "user is not found", 400)
			return
		}
		res.Json(w, toUserResponse(user), 200)
	}
}
func (handler *AuthHandler) deleteUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[DeleteRequest](&w, r)
		if err != nil {
			res.Json(w, err.Error(), 400)
			return
		}
		db := handler.AuthRepository.DataBase
		result := db.Delete(&User{}, "token = ?", body.UserId)
		if result.Error != nil {
			res.Json(w, result.Error.Error(), 500)
			return
		}
		if result.RowsAffected == 0 {
			res.Json(w, "user is not found", 404)
			return
		}
		res.Json(w, "user deleted", 200)
	}
}
func (handler *AuthHandler) changePassword() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[ChangePasswordRequest](&w, r)
		if err != nil {
			return
		}
		var user User
		if err := handler.AuthRepository.DataBase.Where("token = ?", body.UserId).First(&user).Error; err != nil {
			res.Json(w, "user is not found", 404)
			return
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.OldPassword)); err != nil {
			res.Json(w, "old password is incorrect", 401)
			return
		}
		hashed, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), 12)
		if err != nil {
			res.Json(w, "server error", 500)
			return
		}
		handler.AuthRepository.DataBase.Model(&User{}).Where("token = ?", body.UserId).Update("password", string(hashed))
		res.Json(w, "password updated", 200)
	}
}
func (handler *AuthHandler) refresh() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[RefreshRequest](&w, r)
		if err != nil {
			return
		}
		claims, err := jwtpkg.Parse(body.RefreshToken, handler.Config.JWTSecret)
		if err != nil {
			res.Json(w, "invalid or expired refresh token", http.StatusUnauthorized)
			return
		}
		var user User
		if err := handler.AuthRepository.DataBase.Where("token = ?", claims.UserID).First(&user).Error; err != nil {
			res.Json(w, "user not found", http.StatusUnauthorized)
			return
		}
		if user.UserRole != claims.Role {
			res.Json(w, "token is outdated, please re-login", http.StatusUnauthorized)
			return
		}
		pair, err := jwtpkg.NewPair(user.Token, user.UserRole, handler.Config.JWTSecret)
		if err != nil {
			res.Json(w, "token generation failed", 500)
			return
		}
		res.Json(w, pair, 200)
	}
}
func (handler *AuthHandler) me() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := r.Context().Value(ctxkeys.UserContextKey).(User)
		if !ok {
			res.Json(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		user.Password = ""
		res.Json(w, user, 200)
	}
}
func (handler *AuthHandler) register() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[LoginRequest](&w, r)
		if err != nil {
			return
		}
		var user User
		err = handler.AuthRepository.DataBase.Where("login = ?", body.Login).First(&user).Error
		if err == nil {
			res.Json(w, "login is alredy exist", 400)
			return
		}
		tokenId := token.CreateId()
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), 12)
		if err != nil {
			res.Json(w, "ошибка сервера", 500)
			return
		}
		data := User{
			Login:    body.Login,
			Password: string(hashedPassword),
			Token:    tokenId,
			Balance:  0,
			UserRole: "user",
		}
		handler.AuthRepository.DataBase.Create(&data)
		pair, err := jwtpkg.NewPair(data.Token, data.UserRole, handler.Config.JWTSecret)
		if err != nil {
			res.Json(w, "token generation failed", 500)
			return
		}
		res.Json(w, pair, 200)
	}
}
