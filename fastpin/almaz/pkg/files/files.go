package files

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const maxFileSize = 10 * 1024 * 1024

var allowedImageExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true,
	".gif": true, ".webp": true, ".svg": true,
}

var allowedVideoExtensions = map[string]bool{
	".mp4": true, ".webm": true, ".mov": true,
}

func safeFilename(name string) string {
	name = filepath.Base(name)
	var safe strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') ||
			(r >= '0' && r <= '9') || r == '.' || r == '-' || r == '_' {
			safe.WriteRune(r)
		} else {
			safe.WriteRune('_')
		}
	}
	return safe.String()
}

func SaveFile(file multipart.File, header *multipart.FileHeader) (string, error) {
	defer file.Close()

	if header.Size > maxFileSize {
		return "", errors.New("файл слишком большой, максимум 10 МБ")
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExtensions[ext] {
		return "", fmt.Errorf("недопустимый тип файла: %s (разрешены: jpg, jpeg, png, gif, webp, svg)", ext)
	}

	os.MkdirAll("uploads/games", 0755)
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("uploads/games/%d-%s", timestamp, safeFilename(header.Filename))
	out, err := os.Create(filename)
	if err != nil {
		return "", err
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		return "", err
	}
	url := fmt.Sprintf("/uploads/games/%d-%s", timestamp, safeFilename(header.Filename))
	return url, nil
}

func SaveRecord(file multipart.File, header *multipart.FileHeader) (string, error) {
	defer file.Close()

	if header.Size > maxFileSize {
		return "", errors.New("файл слишком большой, максимум 10 МБ")
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedVideoExtensions[ext] && !allowedImageExtensions[ext] {
		return "", fmt.Errorf("недопустимый тип файла: %s (разрешены: mp4, webm, mov, jpg, png)", ext)
	}

	os.MkdirAll("uploads/record", 0755)
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("uploads/record/%d-%s", timestamp, safeFilename(header.Filename))
	out, err := os.Create(filename)
	if err != nil {
		return "", err
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		return "", err
	}
	url := fmt.Sprintf("/uploads/record/%d-%s", timestamp, safeFilename(header.Filename))
	return url, nil
}
func DeleteFile(path string) error {
	if path == "" {
		return nil
	}
	if path[0] == '/' {
		path = path[1:]
	}
	err := os.Remove(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	return nil
}
