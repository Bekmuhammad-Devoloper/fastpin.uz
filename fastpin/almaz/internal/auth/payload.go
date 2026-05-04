package auth

import (
	"demo/almaz/configs"
	"demo/almaz/pkg/db"
	"demo/almaz/pkg/ratelimit"
	"net/http"
)

type User struct {
	Login    string `gorm:"unique" json:"login"`
	Password string `json:"-"`
	Token    string `json:"token"`
	Balance  int    `json:"balance"`
	UserRole string `json:"userRole"`
}


type UserResponse struct {
	Login    string `json:"login"`
	Balance  int    `json:"balance"`
	UserRole string `json:"userRole"`
}


type AdminUserResponse struct {
	Login    string `json:"login"`
	Token    string `json:"token"`
	Balance  int    `json:"balance"`
	UserRole string `json:"userRole"`
}

func toUserResponse(u User) UserResponse {
	return UserResponse{Login: u.Login, Balance: u.Balance, UserRole: u.UserRole}
}

func toAdminUserResponse(u User) AdminUserResponse {
	return AdminUserResponse{Login: u.Login, Token: u.Token, Balance: u.Balance, UserRole: u.UserRole}
}
type UpdateUserRequest struct {
	Token    string `json:"token"`
	UserId   string `json:"userId"`
	UserRole string `json:"userRole"`
}

type AuthHandler struct {
	*configs.Config
	AuthRepository AuthRepository
	Limiter        *ratelimit.LoginLimiter
}

type AuthhandlerDeps struct {
	*configs.Config
	AuthRepository *AuthRepository
	AuthMW         func(http.Handler) http.Handler
	AdminMW        func(http.Handler) http.Handler
}
type LoginRequest struct {
	Login    string `json:"login" validate:"required"`
	Password string `json:"password" validate:"required"`
}
type GetBalanceRequest struct {
	UserId string `json:"userId"`
}
type DeleteRequest struct {
	Token  string `json:"token"`
	UserId string `json:"userId"`
}
type AuthRepository struct {
	DataBase *db.Db
}

type AuthRepositoryDeps struct {
	DataBase *db.Db
}
type ChangePasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	UserId      string `json:"userId" validate:"required"`
	OldPassword string `json:"oldPassword" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required"`
}
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}
type GetUsersRequest struct {
	AdminToken   string  `json:"adminToken"`
	Page         int     `json:"page"`
	Count        int     `json:"count"`
	Login        *string `json:"login"`
	Token        *string `json:"token"`
	StartBalance *int    `json:"startBalance"`
	UserRole     *string `json:"userRole"`
}
