// backend/src/utils/response.js
export const sendResponse = (res, status, data, message = "") => {
  res.status(status).json({
    message,
    data,
  });
};
