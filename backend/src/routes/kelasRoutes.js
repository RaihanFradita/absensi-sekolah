import express from 'express';
import { 
  getAllKelas, 
  getClassById, 
  createKelas, 
  updateKelas, 
  deleteKelas 
} from '../controllers/kelasController.js';

const router = express.Router();

router.get('/', getAllKelas);
router.get('/:id', getClassById);
router.post('/', createKelas);
router.put('/:id', updateKelas);
router.delete('/:id', deleteKelas);

export default router;