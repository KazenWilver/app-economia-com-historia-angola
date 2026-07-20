export type JindungoAccessStatus = "none" | "pending" | "approved" | "rejected";

export interface JindungoAccessRequestItem {
  id: number;
  status: JindungoAccessStatus;
  message: string | null;
  admin_note: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  reviewer?: {
    id: number;
    name: string;
  } | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface JindungoAccessStatusResponse {
  data: {
    status: JindungoAccessStatus;
    has_access: boolean;
    request: JindungoAccessRequestItem | null;
  };
}

export interface JindungoAccessMutationResponse {
  message: string;
  data: JindungoAccessRequestItem;
}

export interface AdminJindungoAccessRequestsResponse {
  data: JindungoAccessRequestItem[];
}
