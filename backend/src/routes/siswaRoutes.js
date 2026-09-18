import express from 'express';
import { 
  getAllSiswa, 
  getSiswaById, 
  createSiswa, 
  updateSiswa, 
  deleteSiswa 
} from '../controllers/siswaController.js';

const router = express.Router();

router.get('/', getAllSiswa);
router.get('/:id', getSiswaById);
router.post('/', createSiswa);
router.put('/:id', updateSiswa);
router.delete('/:id', deleteSiswa);

export default router;