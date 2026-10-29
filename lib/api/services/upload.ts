import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const uploadService = {
  file(formData: FormData) {
    return apiRequest({
      method: "POST",
      url: endpoints.upload,
      data: formData,
      firebaseAuth: false,
    });
  },
};
