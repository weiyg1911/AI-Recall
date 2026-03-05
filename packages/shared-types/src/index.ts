export interface Card {
  id: string;
  front: string;
  back: string;
  hints?: string[];
  createdAt: Date;
}
