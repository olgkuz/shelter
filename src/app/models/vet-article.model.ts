export interface IVetArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
}

export interface IVetArticlesServerRes {
  articles: IVetArticle[];
}
