import { Task } from '../types';

const DB_NAME = 'PomodoroDB';
const DB_VERSION = 1;
export const TASKS_STORE = 'tasks' as const;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TASKS_STORE)) {
        db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const tasksDB = {
  async add(task: Task): Promise<string> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      
      const request = store.add(task);
      request.onsuccess = () => resolve(task.id);
      request.onerror = () => reject(request.error);
    });
  },

  async getAll(): Promise<Task[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readonly');
      const store = transaction.objectStore(TASKS_STORE);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const tasks = request.result || [];
        // Sort by order property, fallback to startTime
        const sortedTasks = [...tasks].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return a.startTime - b.startTime;
        });
        resolve(sortedTasks);
      };
      
      request.onerror = () => reject(request.error);
    });
  },

  async update(task: Task): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.put(task);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async updateAll(tasks: Task[]): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
      
      // Clear existing tasks
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Add all tasks in order
        let count = 0;
        
        // Handle empty array case
        if (tasks.length === 0) {
          resolve();
          return;
        }
        
        tasks.forEach((task, index) => {
          const taskWithOrder = { ...task, order: index };
          const request = store.add(taskWithOrder);
          
          request.onsuccess = () => {
            count++;
            if (count === tasks.length) {
              resolve();
            }
          };
          
          request.onerror = (event) => {
            event.preventDefault(); // Prevent transaction abort
            reject(request.error);
          };
        });
      };
      
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    });
  },

  async delete(taskId: string): Promise<void> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      
      const getAllRequest = store.getAll();
      
      transaction.onerror = () => reject(transaction.error);

      getAllRequest.onsuccess = () => {
        const tasks = getAllRequest.result;
        const sortedTasks = tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        
        const deleteRequest = store.delete(taskId);

        deleteRequest.onsuccess = () => {
          const remainingTasks = sortedTasks
            .filter(t => t.id !== taskId)
            .map((task, index) => ({
              ...task,
              order: index
            }));

          if (remainingTasks.length === 0) {
            resolve();
            return;
          }

          const updateTransaction = db.transaction([TASKS_STORE], 'readwrite');
          const updateStore = updateTransaction.objectStore(TASKS_STORE);
          
          updateTransaction.oncomplete = () => {
            resolve();
          };

          updateTransaction.onerror = () => {
            reject(updateTransaction.error);
          };

          remainingTasks.forEach(task => {
            updateStore.put(task);
          });
        };

        deleteRequest.onerror = () => reject(deleteRequest.error);
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  }
}; 