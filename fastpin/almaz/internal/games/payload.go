package games

import (
	"demo/almaz/configs"
	"demo/almaz/internal/auth"
	"demo/almaz/pkg/db"
	"net/http"
)

type GamesRepository struct {
	DataBase *db.Db
}

type GamesRepositoryDeps struct {
	DataBase *db.Db
}

type Games struct {
	Id          string `json:"id"`
	Video       string `json:"video"`
	Name        string `json:"name"`
	Image       string `json:"image"`
	HowToUseUz  string `json:"howToUseUz"`
	HowToUseRu  string `json:"howToUseRu"`
	HelpImage   string `json:"helpImage"`
	Place       string `json:"place"`
	Description string `json:"description"`
}
type User struct {
	Login    string `gorm:"unique" json:"login"`
	Password string `json:"password"`
	Token    string `json:"token"`
	Balance  int    `json:"balance"`
}

type GamesHandler struct {
	*configs.Config
	GamesRepository GamesRepository
	AuthHandler     *auth.AuthHandler
}

type GameshandlerDeps struct {
	*configs.Config
	GamesRepository *GamesRepository
	AuthHandler     *auth.AuthHandler
	AuthMW          func(http.Handler) http.Handler
	AdminMW         func(http.Handler) http.Handler
}
type GetGamesRequest struct {
	Token string `json:"token"`
}
type DeleteGameRequest struct {
	Token string `json:"token"`
	Id    string `json:"id"`
}
