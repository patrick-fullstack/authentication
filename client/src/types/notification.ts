export interface Notification {
  _id: string;
  recipient: {
    _id: string;
    name: string;
  };
  sender: {
    _id: string;
    name: string;
  };
  type: 'like' | 'comment' | 'editor_added' | 'post_mention' | 'system';
  read: boolean;
  post?: {
    _id: string;
    title: string;
  };
  comment?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}