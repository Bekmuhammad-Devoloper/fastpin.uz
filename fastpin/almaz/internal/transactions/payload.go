package transactions

import (
	"demo/almaz/configs"
	"demo/almaz/internal/auth"
	"demo/almaz/pkg/db"
	"net/http"
)

type Transaction struct {
	Id        string `json:"id" gorm:"primaryKey"`
	UserId    string `json:"userId" gorm:"index"`
	Price     int    `json:"price"`
	Year      int    `json:"year"`
	Month     int    `json:"month"`
	Day       int    `json:"day"`
	Hour      int    `json:"hour"`
	Minute    int    `json:"minute"`
	GameName  string `json:"gameName"`
	DonatName string `json:"donatName"`
	CreatedBy string `json:"createdBy" gorm:"index"` 
	Order     string `json:"order"`
	Status    string `json:"status" gorm:"default:pending;index"` 
	PlayerId  string `json:"playerId" gorm:"default:-"`
	ServerId  string `json:"serverId" gorm:"default:-"`
}
type User struct {
	Login    string `gorm:"unique" json:"login"`
	Password string `json:"password"`
	Token    string `json:"token"`
	Balance  int    `json:"balance"`
}
type TransactionhandlerDeps struct {
	*configs.Config
	TransactionRepository *TransactionRepository
	AuthHandler           *auth.AuthHandler
	AdminMW               func(http.Handler) http.Handler
}
type TransactionRepository struct {
	DataBase *db.Db
}
type createRequest struct {
	Token     string `json:"token"`
	UserId    string `json:"userId"`
	Price     int    `json:"price"`
	GameName  string `json:"gameName"`
	DonatName string `json:"donatName"`
	CreatedBy string `json:"createdBy"`
}
type TransactionHandler struct {
	*configs.Config
	TransactionRepository TransactionRepository
	AuthHandler           *auth.AuthHandler
}
type deleteRequest struct {
	Token string `json:"token"`
	Id    string `json:"id"`
}
type getByPeriodRequest struct {
	Token      string `json:"token"`
	StartDay   int    `json:"startDay"`
	StartMonth int    `json:"startMonth"`
	StartYear  int    `json:"startYear"`
	EndDay     int    `json:"endDay"`
	EndMonth   int    `json:"endMonth"`
	EndYear    int    `json:"endYear"`
}
type getTransactionsRequest struct {
	UserId string `json:"userId"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}
