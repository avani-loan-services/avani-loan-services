export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AvaniDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('enquiries')) {
        db.createObjectStore('enquiries', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveEnquiry = async (enquiry) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('enquiries', 'readwrite');
    tx.objectStore('enquiries').add(enquiry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getEnquiries = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('enquiries', 'readonly');
    const request = tx.objectStore('enquiries').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteEnquiry = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('enquiries', 'readwrite');
    tx.objectStore('enquiries').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
