# Dokumentasi API Absensi Sekolah

Dokumentasi resmi untuk Endpoint REST API Sistem Absensi Sekolah.

- **Base URL**: `http://localhost:3000/api`
- **Format Content-Type**: `application/json`
- **Autentikasi**: JWT (dapat dikirim melalui Header `Authorization: Bearer <token>` atau HTTP-Only Cookie `accessToken`)

---

## Table of Contents
1. [Authentication API (`/api/auth`)](#1-authentication-api-apiauth)
   - [POST /api/auth/login](#post-apiauthlogin)
   - [POST /api/auth/logout](#post-apiauthlogout)
   - [GET /api/auth/me](#get-apiauthme)
2. [Student API (`/api/students`)](#2-student-api-apistudents)
   - [GET /api/students](#get-apistudents)
   - [GET /api/students/classes/list](#get-apistudentsclasseslist)
   - [GET /api/students/:id](#get-apistudentsid)
3. [Teacher API (`/api/teacher`)](#3-teacher-api-apiteacher)
   - [GET /api/teacher](#get-apiteacher)
   - [GET /api/teacher/:id_guru](#get-apiteacherid_guru)
   - [POST /api/teacher/add](#post-apiteacheradd)
   - [PUT /api/teacher/edit/:id_guru](#put-apiteachereditid_guru)
   - [PATCH /api/teacher/:id_guru/deactivate](#patch-apiteacherid_gurudeactivate)

---

## 1. Authentication API (`/api/auth`)

### POST /api/auth/login

Digunakan untuk melakukan autentikasi user (Admin, Guru, Siswa).

* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Request**:
  * **Headers**: `Content-Type: application/json`
  * **Body Parameters**:
    ```json
    {
      "username": "admin", // atau "identifier"
      "password": "password123"
    }
    ```
* **Response**:
  * **200 OK** (Berhasil Login):
    Sets Cookie: `accessToken` (HTTP-Only, Max-Age: 7 Hari)
    ```json
    {
      "success": true,
      "message": "Login berhasil",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "admin",
        "name": "Administrator",
        "role": "admin"
      }
    }
    ```
  * **400 Bad Request** (Validasi Input Gagal / Credential Salah):
    ```json
    {
      "success": false,
      "message": "Username/NIS dan password wajib diisi!"
    }
    ```
    atau
    ```json
    {
      "success": false,
      "message": "Username/NIS atau password salah"
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Terjadi kesalahan server"
    }
    ```

---

### POST /api/auth/logout

Digunakan untuk menghapus cookie sesi dan logout user.

* **Method**: `POST`
* **Endpoint**: `/api/auth/logout`
* **Request**:
  * **Headers**: `Content-Type: application/json`
* **Response**:
  * **200 OK** (Berhasil Logout):
    Clears Cookie: `accessToken`
    ```json
    {
      "success": true,
      "message": "Logout berhasil"
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Gagal memproses logout"
    }
    ```

---

### GET /api/auth/me

Digunakan untuk mengecek profil user yang sedang login berdasarkan token JWT.

* **Method**: `GET`
* **Endpoint**: `/api/auth/me`
* **Request**:
  * **Headers**: `Authorization: Bearer <accessToken>` atau via Cookie `accessToken`
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "username": "admin",
        "name": "Administrator",
        "role": "admin"
      }
    }
    ```
  * **401 Unauthorized** (Token tidak valid/kadaluwarsa):
    ```json
    {
      "success": false,
      "message": "Akses ditolak. Token autentikasi tidak ditemukan."
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Gagal mengambil data user"
    }
    ```

---

## 2. Student API (`/api/students`)

### GET /api/students

Mengambil daftar seluruh siswa beserta informasi kelasnya.

* **Method**: `GET`
* **Endpoint**: `/api/students`
* **Request**:
  * **Headers**: `Content-Type: application/json`
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "students": [
        {
          "id_siswa": 1,
          "nama_siswa": "Ahmad Dani",
          "id_kelas": 2,
          "nama_kelas": "X IPA 1",
          "tingkat": 10,
          "tahun_ajaran": "2023/2024",
          "status_aktif": 1
        }
      ]
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Gagal mengambil data siswa."
    }
    ```

---

### GET /api/students/classes/list

Mengambil daftar seluruh kelas yang aktif.

* **Method**: `GET`
* **Endpoint**: `/api/students/classes/list`
* **Request**:
  * **Headers**: `Content-Type: application/json`
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "classes": [
        {
          "id_kelas": 1,
          "nama_kelas": "X IPA 1",
          "tingkat": 10,
          "tahun_ajaran": "2023/2024"
        }
      ]
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Gagal mengambil data kelas."
    }
    ```

---

### GET /api/students/:id

Mengambil detail data siswa berdasarkan ID Siswa.

* **Method**: `GET`
* **Endpoint**: `/api/students/:id`
* **Request**:
  * **URL Parameters**:
    * `id` (integer/string, required): ID unik siswa (`id_siswa`)
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "student": {
        "id_siswa": 1,
        "nama_siswa": "Ahmad Dani",
        "id_kelas": 2,
        "nama_kelas": "X IPA 1",
        "tingkat": 10,
        "tahun_ajaran": "2023/2024",
        "status_aktif": 1
      }
    }
    ```
  * **404 Not Found**:
    ```json
    {
      "success": false,
      "message": "Siswa tidak ditemukan."
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Gagal mengambil data siswa."
    }
    ```

---

## 3. Teacher API (`/api/teacher`)

### GET /api/teacher

Mengambil daftar semua data guru.

* **Method**: `GET`
* **Endpoint**: `/api/teacher`
* **Request**:
  * **Headers**: `Content-Type: application/json`
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "message": "data berhasil diambil",
      "data": [
        {
          "id_guru": 1,
          "nip": "198501012010011001",
          "nama_guru": "Budi Santoso, S.Pd",
          "status_aktif": 1,
          "username": "budisantoso",
          "role": "guru"
        }
      ]
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Terjadi kesalahan server"
    }
    ```

---

### GET /api/teacher/:id_guru

Mengambil detail data guru berdasarkan ID Guru.

* **Method**: `GET`
* **Endpoint**: `/api/teacher/:id_guru`
* **Request**:
  * **URL Parameters**:
    * `id_guru` (integer/string, required): ID unik guru (`id_guru`)
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "message": "data berhasil diambil",
      "data": {
        "id_guru": 1,
        "nip": "198501012010011001",
        "nama_guru": "Budi Santoso, S.Pd",
        "status_aktif": 1,
        "username": "budisantoso",
        "role": "guru"
      }
    }
    ```
  * **400 Bad Request**:
    ```json
    {
      "success": false,
      "message": "id tidak ditemukan"
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Terjadi kesalahan server"
    }
    ```

---

### POST /api/teacher/add

Menambahkan data guru baru beserta akun user-nya.

* **Method**: `POST`
* **Endpoint**: `/api/teacher/add`
* **Request**:
  * **Headers**: `Content-Type: application/json`
  * **Body Parameters**:
    ```json
    {
      "username": "budisantoso",
      "password": "password123",
      "nip": "198501012010011001",
      "nama_guru": "Budi Santoso, S.Pd"
    }
    ```
* **Response**:
  * **201 Created**:
    ```json
    {
      "success": true,
      "message": "Data guru berhasil ditambahkan"
    }
    ```
  * **400 Bad Request**:
    ```json
    {
      "success": false,
      "message": "Semua field wajib diisi!"
    }
    ```
    atau
    ```json
    {
      "success": false,
      "message": "Username sudah digunakan"
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Terjadi kesalahan server"
    }
    ```

---

### PUT /api/teacher/edit/:id_guru

Mengubah data profil guru dan username akun user.

* **Method**: `PUT`
* **Endpoint**: `/api/teacher/edit/:id_guru`
* **Request**:
  * **URL Parameters**:
    * `id_guru` (integer/string, required): ID unik guru (`id_guru`)
  * **Body Parameters**:
    ```json
    {
      "id_user": 2,
      "username": "budisantoso_edit",
      "nip": "198501012010011001",
      "nama_guru": "Budi Santoso, M.Pd"
    }
    ```
* **Response**:
  * **201 Created**:
    ```json
    {
      "success": true,
      "message": "Update berhasil"
    }
    ```
  * **400 Bad Request**:
    ```json
    {
      "success": false,
      "message": "Semua field wajib diisi"
    }
    ```
    atau
    ```json
    {
      "success": false,
      "message": "gagal mengubah data"
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Terjadi kesalahan server"
    }
    ```

---

### PATCH /api/teacher/:id_guru/deactivate

Nonaktifkan data guru dan akun user (Soft Delete).

* **Method**: `PATCH`
* **Endpoint**: `/api/teacher/:id_guru/deactivate`
* **Request**:
  * **URL Parameters**:
    * `id_guru` (integer/string, required): ID unik guru (`id_guru`)
  * **Body Parameters**:
    ```json
    {
      "id_user": 2
    }
    ```
* **Response**:
  * **200 OK**:
    ```json
    {
      "success": true,
      "message": "update berhasil"
    }
    ```
  * **400 Bad Request**:
    ```json
    {
      "success": false,
      "message": "id tidak ditemukan"
    }
    ```
  * **500 Internal Server Error**:
    ```json
    {
      "success": false,
      "message": "Terjadi kesalahan server"
    }
    ```
