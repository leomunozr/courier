import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Seed endpoint for testing only
export const seedUser = async (req: Request, res: Response) => {
  try {
    const count = await prisma.user.count();
    if (count > 0) return res.json({ message: 'Users already seeded' });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@courier.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    res.json({ message: 'User seeded', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Seed failed' });
  }
};