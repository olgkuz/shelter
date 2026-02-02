import { environment } from "../../../environments/environment";

const serverIp = environment.apiUrl;

export const API = {

  // ====== Pets ======

  // Получить список животных (с фильтрами)
  pets: `${serverIp}/pets`,

  // Получить одно животное по id
  petById: `${serverIp}/pets`, // + /:id

  // Получить фото животного
  petPhotos: `${serverIp}/pets`, // + /:id/photos


  // ====== Static Images ======

  // Картинки (галерея)
  images: `${serverIp}/images`,


  // ====== Config (если понадобится) ======

  config: `/config/config.json`


};
