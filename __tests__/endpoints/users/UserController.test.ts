import request from 'supertest';
import { App } from '../../../src/app';
import { IUserResponse } from '../../../src/interfaces/IUserResponse';
import { UserRepository } from '../../../src/endpoints/users/userRepository';
import { IUser } from '../../../src/interfaces/IUser';

// Cria uma instância da aplicação para executar os testes
const app = new App().server.listen(8081);

describe('UserController', () => {
  afterAll((done) => {
    // Fechar o servidor após os testes
    app.close(done);
  });

  it('Deve retornar a lista de usuários corretamente', async () => {
    const mockUsers: IUser[] = [
      { id: 1, name: 'Naruto', age: 10 },
      { id: 2, name: 'Sasuke', age: 18 },
      { id: 3, name: 'Kakashi', age: 50 },
    ];

    const expectedUsers: IUserResponse[] = [
      { id: 1, name: 'Naruto', age: 10, isOfAge: false },
      { id: 2, name: 'Sasuke', age: 18, isOfAge: true },
      { id: 3, name: 'Kakashi', age: 50, isOfAge: true },
    ];

    jest.spyOn(UserRepository.prototype, 'list').mockReturnValueOnce(mockUsers);

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUsers);
  });

  it('Deve retornar um usuário corretamente', async () => {
    const mockUser: IUser = { id: 1, name: 'Naruto', age: 10 };
    const expectedUser: IUserResponse = { id: 1, name: 'Naruto', age: 10, isOfAge: false };

    jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(mockUser);

    const response = await request(app).get('/users/1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUser);
  });

  it('Deve retornar um erro ao tentar buscar um usuário inexistente', async () => {
    jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(undefined);

    const response = await request(app).get('/users/100000');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe('Usuário não encontrado');
  });

  it('Deve criar um usuário corretamente', async () => {
    const mockUser: IUser = { id: 1, name: 'Naruto', age: 10 };

    jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(true);

    const response = await request(app).post('/users').send(mockUser);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Usuário criado com sucesso');
  });

  it('Deve retornar um erro ao tentar criar um usuário com id já existente', async () => {
    const mockUser: IUser = { id: 1, name: 'Naruto', age: 10 };

    jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(false);

    const response = await request(app).post('/users').send(mockUser);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe('Falha ao criar o usuário');
  });

  it('Deve deletar um usuário corretamente', async () => {
    jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(true);

    const response = await request(app).delete('/users/1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('Deve retornar um erro ao tentar deletar um usuário inexistente', async () => {
    jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(false);

    const response = await request(app).delete('/users/100000');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
