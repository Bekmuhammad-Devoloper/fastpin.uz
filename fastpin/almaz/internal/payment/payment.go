package payment

import (
	"bytes"
	"demo/almaz/internal/auth"
	"demo/almaz/pkg/ctxkeys"
	"demo/almaz/pkg/db"
	"demo/almaz/pkg/req"
	"demo/almaz/pkg/res"
	"demo/almaz/pkg/token"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	telegramBotToken = "7982130574:AAFQR-DbdO44Kysnwb41EzY9U_cfjwJnHFI"
)

var telegramAdmins = []int64{7866997948, 5469349844}

func sendTelegramMessage(text string) {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", telegramBotToken)
	for _, chatID := range telegramAdmins {
		payload, _ := json.Marshal(map[string]interface{}{
			"chat_id":    chatID,
			"text":       text,
			"parse_mode": "HTML",
		})
		http.Post(url, "application/json", bytes.NewBuffer(payload))
	}
}

func NewPaymentRepository(dataBase *db.Db) *PaymentRepository {
	return &PaymentRepository{
		DataBase: dataBase,
	}
}
func NewPaymentHandler(router *http.ServeMux, deps PaymenthandlerDeps) *PaymentHandler {
	handler := &PaymentHandler{
		Config:            deps.Config,
		PaymentRepository: *deps.PaymentRepository,
		AuthHandler:       deps.AuthHandler,
	}
	router.Handle("/payment/getPayment", deps.AuthMW(http.HandlerFunc(handler.getPayment())))
	router.Handle("/payment/getPaymentByUser", deps.AuthMW(http.HandlerFunc(handler.getPaymentByUser())))
	router.Handle("/payment/getAllPayment", deps.AuthMW(http.HandlerFunc(handler.getAllPayment())))
	router.HandleFunc("/payment/createPayment", handler.createPayment())
	router.Handle("/payment/updatePayment", deps.AdminMW(http.HandlerFunc(handler.updatePayment())))
	router.Handle("/payment/deletePayment", deps.AuthMW(http.HandlerFunc(handler.deletePayment())))
	router.HandleFunc("/payment/createTelegram", handler.createTelegram())
	router.Handle("/payment/getPaymentByPeriod", deps.AdminMW(http.HandlerFunc(handler.getPaymentByPeriod())))
	return handler
}
func (handler *PaymentHandler) getPayment() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var payments []Payment
		if err := handler.PaymentRepository.DataBase.
			Where("is_working = ?", true).
			Find(&payments).Error; err != nil {
			res.Json(w, err, 500)
			return
		}

		var result []Payment
		var expiredIds []string

		for _, p := range payments {
			if isExpired(p) {
				expiredIds = append(expiredIds, p.Id)
			} else {
				result = append(result, p)
			}
		}

		if len(expiredIds) > 0 {
			err := handler.PaymentRepository.DataBase.
				Model(&Payment{}).
				Where("id IN ?", expiredIds).
				Update("is_working", false).Error
			if err != nil {
				res.Json(w, err, 500)
				return
			}
		}

		res.Json(w, result, 200)
	}
}
func (handler *PaymentHandler) getPaymentByUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		requester, ok := r.Context().Value(ctxkeys.UserContextKey).(auth.User)
		if !ok {
			res.Json(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		body, err := req.HandleBody[deletePaymentRequest](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}
		if requester.UserRole != "admin" && requester.UserRole != "superUser" && requester.Token != body.Id {
			res.Json(w, "forbidden", http.StatusForbidden)
			return
		}
		var payments []Payment
		err = handler.PaymentRepository.DataBase.
			Where("user_id = ?", body.Id).
			Find(&payments).Error
		if err != nil {
			res.Json(w, err, 500)
			return
		}

		var result []Payment
		var expiredIds []string

		for _, p := range payments {
			if isExpired(p) {
				expiredIds = append(expiredIds, p.Id)
			} else {
				result = append(result, p)
			}
		}

		if len(expiredIds) > 0 {
			err := handler.PaymentRepository.DataBase.
				Model(&Payment{}).
				Where("id IN ?", expiredIds).
				Update("is_working", false).Error
			if err != nil {
				res.Json(w, err, 500)
				return
			}
		}

		res.Json(w, result, 200)
	}
}
func (handler *PaymentHandler) getAllPayment() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var payments []Payment
		if err := handler.PaymentRepository.DataBase.
			Where("is_working = ?", true).
			Find(&payments).Error; err != nil {
			res.Json(w, err, 500)
			return
		}

		var result []Payment
		var expiredIds []string

		for _, p := range payments {
			if isExpired(p) {
				expiredIds = append(expiredIds, p.Id)
			} else {
				result = append(result, p)
			}
		}

		if len(expiredIds) > 0 {
			err := handler.PaymentRepository.DataBase.
				Model(&Payment{}).
				Where("id IN ?", expiredIds).
				Update("is_working", false).Error
			if err != nil {
				res.Json(w, err, 500)
				return
			}
		}

		res.Json(w, result, 200)
	}
}
func (handler *PaymentHandler) createPayment() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[createPaymentRequest](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}
		loc := time.FixedZone("UZT", 5*60*60)
		now := time.Now().In(loc)
		tx := handler.PaymentRepository.DataBase.Begin()
		if tx.Error != nil {
			res.Json(w, tx.Error, 500)
			return
		}
		var payments []Payment
		if err := tx.
			Set("gorm:query_option", "FOR UPDATE").
			Where("is_working = ?", true).
			Find(&payments).Error; err != nil {
			tx.Rollback()
			res.Json(w, err, 500)
			return
		}
		for _, p := range payments {
			if p.UserId == body.UserId {
				tx.Rollback()
				res.Json(w, p, 409)
				return
			}
			if isExpired(p) {
				handler.PaymentRepository.DataBase.
					Model(&Payment{}).
					Where("id = ?", p.Id).
					Update("is_working", false)
				continue
			}
			if p.Price == body.Price {
				tx.Rollback()
				res.Json(w, map[string]string{
					"error": "payment is busy",
				}, 409)
				return
			}
		}
		payment := Payment{
			Id:        token.CreateId(),
			Year:      now.Year(),
			Month:     int(now.Month()),
			Day:       now.Day(),
			Hour:      now.Hour(),
			Minute:    now.Minute(),
			UserId:    body.UserId,
			Price:     body.Price,
			IsWorking: true,
		}
		if err := tx.Create(&payment).Error; err != nil {
			tx.Rollback()
			res.Json(w, err, 500)
			return
		}
		tx.Commit()
		res.Json(w, payment, 200)
	}
}
func (handler *PaymentHandler) updatePayment() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[updatePaymentRequest](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}
		var payment Payment
		err = handler.PaymentRepository.DataBase.
			Where("id = ?", body.Id).
			First(&payment).Error
		if err != nil {
			res.Json(w, err, 404)
			return
		}
		payment.IsWorking = body.IsWorking
		err = handler.PaymentRepository.DataBase.Save(&payment).Error
		if err != nil {
			res.Json(w, err, 500)
			return
		}
		loc := time.FixedZone("UZT", 5*60*60)
		now := time.Now().In(loc)
		tx := Transaction{
			Id:        token.CreateId(),
			UserId:    body.UserId,
			Price:     payment.Price,
			Year:      now.Year(),
			Month:     int(now.Month()),
			Day:       now.Day(),
			Hour:      now.Hour(),
			Minute:    now.Minute(),
			GameName:  "-",
			DonatName: "-",
			CreatedBy: "admin",
			Order:     "-",
		}
		_, err = handler.AuthHandler.UpdateBalance(body.UserId, payment.Price)
		if err != nil {
			res.Json(w, err, 500)
			return
		}
		if err := handler.PaymentRepository.DataBase.Create(&tx).Error; err != nil {
			res.Json(w, err, 500)
			return
		}
		if err := handler.PaymentRepository.DataBase.Delete(&payment).Error; err != nil {
			res.Json(w, err, 500)
			return
		}
		res.Json(w, tx, 200)
	}
}
func (handler *PaymentHandler) deletePayment() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		requester, ok := r.Context().Value(ctxkeys.UserContextKey).(auth.User)
		if !ok {
			res.Json(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		body, err := req.HandleBody[deletePaymentRequest](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}
		var payment Payment
		if err := handler.PaymentRepository.DataBase.Where("id = ?", body.Id).First(&payment).Error; err != nil {
			res.Json(w, "payment not found", http.StatusNotFound)
			return
		}
		if requester.UserRole != "admin" && requester.UserRole != "superUser" && requester.Token != payment.UserId {
			res.Json(w, "forbidden", http.StatusForbidden)
			return
		}
		if err := handler.PaymentRepository.DataBase.Where("id = ?", body.Id).Delete(&Payment{}).Error; err != nil {
			res.Json(w, err, 500)
			return
		}
		res.Json(w, map[string]string{
			"status": "deleted",
		}, 200)
	}
}
func (handler *PaymentHandler) createTelegram() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[createPaymentTelegram](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}
		loc := time.FixedZone("UZT", 5*60*60)
		telegramTime := time.Date(
			body.Year,
			time.Month(body.Month),
			body.Day,
			body.Hour,
			body.Minute,
			0, 0, loc,
		)
		fromTime := telegramTime.Add(-48 * time.Hour)
		toTime := telegramTime.Add(5 * time.Minute)
		fromY, fromM, fromD := fromTime.Year(), int(fromTime.Month()), fromTime.Day()
		toY, toM, toD := toTime.Year(), int(toTime.Month()), toTime.Day()
		fromH, fromMin := fromTime.Hour(), fromTime.Minute()
		toH, toMin := toTime.Hour(), toTime.Minute()
		var payment Payment
		err = handler.PaymentRepository.DataBase.
			Where("price = ?", body.Amount).
			Where(`(
				(year > ?) OR 
				(year = ? AND month > ?) OR 
				(year = ? AND month = ? AND day > ?) OR 
				(year = ? AND month = ? AND day = ? AND hour > ?) OR 
				(year = ? AND month = ? AND day = ? AND hour = ? AND minute >= ?)
			) AND (
				(year < ?) OR 
				(year = ? AND month < ?) OR 
				(year = ? AND month = ? AND day < ?) OR 
				(year = ? AND month = ? AND day = ? AND hour < ?) OR 
				(year = ? AND month = ? AND day = ? AND hour = ? AND minute <= ?)
			)`,
				fromY, fromY, fromM, fromY, fromM, fromD, fromY, fromM, fromD, fromH, fromY, fromM, fromD, fromH, fromMin,
				toY, toY, toM, toY, toM, toD, toY, toM, toD, toH, toY, toM, toD, toH, toMin,
			).
			Order("year DESC, month DESC, day DESC, hour DESC, minute DESC").
			First(&payment).Error

		timeStr := fmt.Sprintf("%02d:%02d %02d.%02d.%d", body.Hour, body.Minute, body.Day, body.Month, body.Year)

		if err != nil {
			unmatched := Payment{
				Id:        token.CreateId(),
				Year:      body.Year,
				Month:     body.Month,
				Day:       body.Day,
				Hour:      body.Hour,
				Minute:    body.Minute,
				UserId:    "",
				Price:     body.Amount,
				IsWorking: false,
				Sender:    body.Sender,
			}
			handler.PaymentRepository.DataBase.Create(&unmatched)

			msg := fmt.Sprintf(
				"💰 <b>Новый платёж</b>\n"+
					"👤 Отправитель: <b>%s</b>\n"+
					"💵 Сумма: <b>%d</b>\n"+
					"🕐 Время: <b>%s</b>\n"+
					"📋 Бронирование: <b>не найдено</b>",
				body.Sender, body.Amount, timeStr,
			)
			sendTelegramMessage(msg)
			res.Json(w, map[string]string{"error": "no matching reservation found"}, 404)
			return
		}
		if !payment.IsWorking {
			var count int64
			handler.PaymentRepository.DataBase.Model(&Transaction{}).
				Where("payment_id = ?", payment.Id).
				Count(&count)
			if count > 0 {
				msg := fmt.Sprintf(
					"⚠️ <b>Повторный платёж</b>\n"+
						"👤 Отправитель: <b>%s</b>\n"+
						"💵 Сумма: <b>%d</b>\n"+
						"🕐 Время: <b>%s</b>\n"+
						"📋 Бронирование: <b>уже обработано</b>",
					body.Sender, body.Amount, timeStr,
				)
				sendTelegramMessage(msg)
				res.Json(w, map[string]string{"error": "reservation already processed"}, 409)
				return
			}
		}
		txDb := handler.PaymentRepository.DataBase.Begin()
		if txDb.Error != nil {
			res.Json(w, txDb.Error, 500)
			return
		}

		transaction := Transaction{
			Id:        token.CreateId(),
			UserId:    payment.UserId,
			Price:     body.Amount,
			Year:      body.Year,
			Month:     body.Month,
			Day:       body.Day,
			Hour:      body.Hour,
			Minute:    body.Minute,
			GameName:  "-",
			DonatName: "-",
			CreatedBy: body.Sender,
			Order:     "-",
			Status:    "completed",
		}

		if err := txDb.Create(&transaction).Error; err != nil {
			txDb.Rollback()
			handler.saveFailedTransaction(body, payment.UserId)
			res.Json(w, err, 500)
			return
		}
		_, err = handler.AuthHandler.UpdateBalance(payment.UserId, payment.Price)
		if err != nil {
			txDb.Rollback()
			handler.saveFailedTransaction(body, payment.UserId)
			res.Json(w, err, 500)
			return
		}

		if err := txDb.Delete(&payment).Error; err != nil {
			txDb.Rollback()
			handler.saveFailedTransaction(body, payment.UserId)
			res.Json(w, err, 500)
			return
		}
		txDb.Commit()

		userLogin := payment.UserId
		var user struct {
			Login string
		}
		if err := handler.PaymentRepository.DataBase.
			Table("users").
			Select("login").
			Where("token = ?", payment.UserId).
			First(&user).Error; err == nil {
			userLogin = user.Login
		}

		successMsg := fmt.Sprintf(
			"✅ <b>Платёж зачислен</b>\n"+
				"👤 Отправитель: <b>%s</b>\n"+
				"💵 Сумма: <b>%d</b>\n"+
				"🕐 Время: <b>%s</b>\n"+
				"📋 Забронировано: <b>да</b>\n"+
				"🎮 Логин пользователя: <b>%s</b>",
			body.Sender, body.Amount, timeStr, userLogin,
		)
		sendTelegramMessage(successMsg)

		fmt.Println("success", body)
		res.Json(w, map[string]string{
			"status":         "success",
			"user_id":        payment.UserId,
			"amount":         fmt.Sprintf("%d", body.Amount),
			"transaction_id": transaction.Id,
		}, 200)
	}
}
func (handler *PaymentHandler) getPaymentByPeriod() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[getPaymentByPeriodRequest](&w, r)
		if err != nil {
			res.Json(w, err, 400)
			return
		}
		var payments []Payment
		err = handler.PaymentRepository.DataBase.
			Where(
				"(year > ? OR "+
					"(year = ? AND month > ?) OR "+
					"(year = ? AND month = ? AND day >= ?)) "+
					"AND "+
					"(year < ? OR "+
					"(year = ? AND month < ?) OR "+
					"(year = ? AND month = ? AND day <= ?))",
				body.StartYear, body.StartYear, body.StartMonth, body.StartYear, body.StartMonth, body.StartDay,
				body.EndYear, body.EndYear, body.EndMonth, body.EndYear, body.EndMonth, body.EndDay,
			).
			Order("year DESC, month DESC, day DESC, hour DESC, minute DESC").
			Find(&payments).Error
		if err != nil {
			res.Json(w, err, 500)
			return
		}

		res.Json(w, payments, 200)
	}
}

func (handler *PaymentHandler) saveFailedTransaction(body *createPaymentTelegram, userId string) {
	failed := Transaction{
		Id:        token.CreateId(),
		UserId:    userId,
		Price:     body.Amount,
		Year:      body.Year,
		Month:     body.Month,
		Day:       body.Day,
		Hour:      body.Hour,
		Minute:    body.Minute,
		GameName:  "-",
		DonatName: "-",
		CreatedBy: body.Sender,
		Order:     "-",
		Status:    "failed",
	}
	handler.PaymentRepository.DataBase.Create(&failed)
}
