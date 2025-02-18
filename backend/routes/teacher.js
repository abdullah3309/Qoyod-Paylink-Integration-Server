const { Teacher } = require('../models');

const teacherController = {
  async getAllTeachers(req, res) {
    try {
      const teachers = await Teacher.findAll();
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createTeacher(req, res) {
    try {
      const teacher = await Teacher.create(req.body);
      res.status(201).json(teacher);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const updated = await Teacher.update(req.body, {
        where: { id },
        returning: true
      });
      if (updated[0] === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      const teacher = await Teacher.findByPk(id);
      res.json(teacher);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteTeacher(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Teacher.destroy({
        where: { id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = teacherController;