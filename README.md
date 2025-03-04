# A1Menu - Murakkab Menyu Boshqaruv Tizimi

[![Node.js](https://img.shields.io/badge/Node.js-v22.13.1-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-blue)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-3.12.0-orange)](https://www.mysql.com/) 

**A1Menu** — bu restoranlar, kafelar va oziq-ovqat xizmatlari uchun mo‘ljallangan to‘liq funksional menyu boshqaruv tizimi. Ushbu loyiha Node.js va Express.js asosida qurilgan bo‘lib, MySQL ma’lumotlar bazasi bilan integratsiyalashgan, foydalanuvchi autentifikatsiyasi, fayl yuklash, email xabarnomalari va rasm optimizatsiyasi kabi xususiyatlarni taqdim etadi. Bu tizim RESTful API orqali frontend ilovalar yoki mobil dasturlar bilan osongina ishlay oladi.

## Loyiha maqsadi
- Restoranlar uchun menyuni boshqarish va foydalanuvchilar uchun zakas qilish imkonini yaratish.
- Tez, xavfsiz va moslashuvchan backend infratuzilmasini ta’minlash.
- Kichik va o‘rta bizneslar uchun foydalanishga qulay yechim taklif qilish.

## Xususiyatlar
- **Menyu boshqaruvi**: Taomlar qo‘shish, tahrirlash, o‘chirish va ro‘yxatni ko‘rish.
- **Foydalanuvchi autentifikatsiyasi**: JWT va bcryptjs yordamida xavfsiz login va ro‘yxatdan o‘tish.
- **Fayl yuklash**: Menyu rasmlarini yuklash (multer bilan).
- **Rasm optimizatsiyasi**: Yuklangan rasmlarni sharp yordamida siqish va o‘lchamini o‘zgartirish.
- **Email xabarnomalari**: Foydalanuvchilarga tasdiqlash yoki bildirishnoma yuborish (nodemailer).
- **MySQL integratsiyasi**: Ma’lumotlarni doimiy saqlash va boshqarish. 

## Talablar
Loyihani ishga tushirish uchun quyidagi dasturiy ta’minot va vositalar kerak:
- **Node.js**: v22.13.1 yoki undan yuqori
- **npm**: Node.js bilan birga keladi
- **MySQL**: 8.0 yoki undan yuqori
- **Git**: Repozitoriyani klon qilish uchun

## O‘rnatish
Loyihani mahalliy kompyuteringizda ishga tushirish uchun quyidagi qadamlarni bajaring:

1. **Repozitoriyani klon qiling**:
   ```bash
   git clone https://github.com/B0YB0L0/A1menu.git
2. **Loyiha papkasiga o‘ting:**
    ```bash
   cd A1menu
3. **Kerakli paketlarni o‘rnating:**
    ```bash
    npm install
4. **Serverni ishga tushiring:**
   **Oddiy ishga tushirish:**
    ```bash
    npm start
  5. **Nodemon bilan ishga tushurish:**
      ```bash    
     npm run dev

  **Server odatda http://localhost:4100 da ishlaydi.**

  **Kelajakdagi rejalarga misollar**
   - Frontend interfeysi qo‘shish (React yoki Vue bilan).
   - Kafeni hujjatlar asosida ro‘yxatdan o‘tkazish:
        - JShShIR yoki STIR raqami (yuridik shaxslar uchun)
        - Bank rekvizitlari (to‘lov tizimiga bog‘lash uchun)
        - Guvohnoma/firma hujjatlari yuklanadi

   - Buyurtma tizimi integratsiyasi.

     **Muallif**
        - **Ism:** Sanatbek
        - **GitHub:** sanatillo
        - **Aloqa:** sanatbek@gmail.com
