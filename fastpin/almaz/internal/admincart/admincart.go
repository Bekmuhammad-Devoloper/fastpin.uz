package admincart

import (
	"demo/almaz/pkg/db"
	"demo/almaz/pkg/req"
	"demo/almaz/pkg/res"
	"demo/almaz/pkg/token"
	"net/http"
)

func NewAdmincartRepository(dataBase *db.Db) *AdmincartRepository {
	return &AdmincartRepository{
		DataBase: dataBase,
	}
}
func NewAdmincartHandler(router *http.ServeMux, deps AdmincarthandlerDeps) *AdmincartHandler {
	handler := &AdmincartHandler{
		Config:              deps.Config,
		AdmincartRepository: *deps.AdmincartRepository,
		AuthHandler:         deps.AuthHandler,
	}
	router.Handle("/admincart/create", deps.AdminMW(http.HandlerFunc(handler.create())))
	router.Handle("/admincart/getAdmincart", deps.AuthMW(http.HandlerFunc(handler.getAdmincart())))
	router.Handle("/admincart/delete", deps.AdminMW(http.HandlerFunc(handler.deleteAdmincart())))
	return handler
}
func (handler *AdmincartHandler) create() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[CreateAdmincartRequest](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}

		newAdmincart := Admincart{
			Id:     token.CreateId(),
			Name:   body.Name,
			Number: body.Number,
			Type:   body.Type,
		}
		if err := handler.AdmincartRepository.DataBase.Create(&newAdmincart).Error; err != nil {
			res.Json(w, "db error", 500)
			return
		}
		res.Json(w, newAdmincart, 200)
	}
}
func (handler *AdmincartHandler) getAdmincart() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var admincart []Admincart
		if err := handler.AdmincartRepository.DataBase.Model(&Admincart{}).Find(&admincart).Error; err != nil {
			res.Json(w, "failed to get admincart", 500)
			return
		}
		res.Json(w, admincart, 200)

	}
}
func (handler *AdmincartHandler) deleteAdmincart() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[DeleteAdmincartRequest](&w, r)
		if err != nil {
			res.Json(w, err.Error(), 400)
			return
		}
		db := handler.AdmincartRepository.DataBase
		result := db.Delete(&Admincart{}, "id = ?", body.Id)
		if result.Error != nil {
			res.Json(w, result.Error.Error(), 500)
			return
		}
		if result.RowsAffected == 0 {
			res.Json(w, "game is not found", 404)
			return
		}
		res.Json(w, "game deleted", 200)
	}
}
