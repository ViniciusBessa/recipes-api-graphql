import typeDefs from '../schema';
import resolvers from '../resolvers';
import createrServer from '../app';
import request from 'supertest';
import { Server } from 'http';
import { GraphQLRequest } from 'apollo-server-types';

describe('Categories Mutations', () => {
  let server: Server;

  beforeAll(async () => {
    server = await createrServer(typeDefs, resolvers);
  });

  afterAll(() => {
    server?.close();
  });

  describe('User is admin', () => {
    let adminToken: string;

    beforeAll(async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email } token } }',
        variables: {
          input: { email: 'syntyche@gmail.com', password: 'sjoann' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      adminToken = response.body.data.loginUser.token;
    });

    it('should return all categories', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { categories { id name createdAt updatedAt recipes { recipe { id name } } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.categories.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.categories[0].id).toBeTruthy();
      expect(response.body.data.categories[0].name).toBeTruthy();
      expect(response.body.data.categories[0].createdAt).toBeTruthy();
      expect(response.body.data.categories[0].updatedAt).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.id
      ).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.name
      ).toBeTruthy();
    });

    it('should return one category', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { categories(id: $id) { id name createdAt updatedAt recipes { recipe { id name } } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.categories.length).toEqual(1);
      expect(response.body.data.categories[0].id).toEqual(2);
      expect(response.body.data.categories[0].name).toEqual('Dessert');
      expect(response.body.data.categories[0].createdAt).toBeTruthy();
      expect(response.body.data.categories[0].updatedAt).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.id
      ).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.name
      ).toBeTruthy();
    });

    it('should successfully create a new category', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($name: String!) { createCategory(name: $name) { id name } }',
        variables: { name: 'Mexican' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createCategory.id).toEqual(6);
      expect(response.body.data.createCategory.name).toEqual('Mexican');
    });

    it('should fail to create a new category by missing the name', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($name: String!) { createCategory(name: $name) { id name } }',
        variables: { name: ' ' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a category', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateCategoryId: Int!, $newName: String!) { updateCategory(id: $updateCategoryId, newName: $newName) { id name } }',
        variables: { updateCategoryId: 4, newName: 'Italian Dessert' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateCategory.id).toEqual(4);
      expect(response.body.data.updateCategory.name).toEqual(
        'Italian Dessert'
      );
    });

    it('should fail to update a category by missing the new name', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateCategoryId: Int!, $newName: String!) { updateCategory(id: $updateCategoryId, newName: $newName) { id name } }',
        variables: { updateCategoryId: 4, newName: '  ' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a category', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteCategoryId: Int!) { deleteCategory(id: $deleteCategoryId) { id name } }',
        variables: { deleteCategoryId: 5 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteCategory.id).toEqual(5);
      expect(response.body.data.deleteCategory.name).toEqual('Spanish');
    });
  });

  describe('User is not logged in', () => {
    it('should return all categories', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { categories { id name createdAt updatedAt recipes { recipe { id name } } } }',
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.categories.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.categories[0].id).toBeTruthy();
      expect(response.body.data.categories[0].name).toBeTruthy();
      expect(response.body.data.categories[0].createdAt).toBeTruthy();
      expect(response.body.data.categories[0].updatedAt).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.id
      ).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.name
      ).toBeTruthy();
    });

    it('should return one category', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { categories(id: $id) { id name createdAt updatedAt recipes { recipe { id name } } } }',
        variables: { id: 2 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.categories.length).toEqual(1);
      expect(response.body.data.categories[0].id).toEqual(2);
      expect(response.body.data.categories[0].name).toEqual('Dessert');
      expect(response.body.data.categories[0].createdAt).toBeTruthy();
      expect(response.body.data.categories[0].updatedAt).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.id
      ).toBeTruthy();
      expect(
        response.body.data.categories[0].recipes[0].recipe.name
      ).toBeTruthy();
    });

    it('should fail to create a new category by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($name: String!) { createCategory(name: $name) { id name } }',
        variables: { name: 'American' },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a category by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateCategoryId: Int!, $newName: String!) { updateCategory(id: $updateCategoryId, newName: $newName) { id name } }',
        variables: { updateCategoryId: 4, newName: 'Italian Dessert' },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete a category', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteCategoryId: Int!) { deleteCategory(id: $deleteCategoryId) { id name } }',
        variables: { deleteCategoryId: 1 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });
});
