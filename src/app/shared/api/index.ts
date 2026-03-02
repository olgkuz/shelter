import { environment } from "../../../environments/environment";

const serverIp = environment.apiUrl;

export const API = {

  // ====== Pets ======

  // Получить список животных (с фильтрами)
  pets: `${serverIp}/pets`,

  // Получить одно животное по id
  petById: `${serverIp}/pets`, // + /:id

  // Получить похожих животных
  petSimilar: `${serverIp}/pets`, // + /:id/similar

  // Получить фото животного
  petPhotos: `${serverIp}/pets`, // + /:id/photos


  // ====== Static Images ======

  // Картинки (галерея)
  images: `${serverIp}/images`,


  // ====== Vet Advice ======

  // Получить список статей ветеринара
  vetAdvice: `${serverIp}/vet-advice`,

  // Получить статью по id
  vetAdviceById: `${serverIp}/vet-advice`, // + /:id


  // ====== Announcements ======

  // Получить все объявления
  announcements: `${serverIp}/announcements`,

  // Получить только опубликованные объявления
  announcementsPublished: `${serverIp}/announcements/published`,

  // Получить объявление по id
  announcementById: `${serverIp}/announcements`, // + /:id


  // ====== Config (если понадобится) ======

  config: `/config/config.json`


};
