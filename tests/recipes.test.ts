import typeDefs from '../schema';
import resolvers from '../resolvers';
import createrServer from '../app';
import request from 'supertest';
import { Server } from 'http';
import { GraphQLRequest } from 'apollo-server-types';

describe('Recipes Mutations', () => {
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

    it('should return all recipes', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { recipes { id name description createdAt updatedAt } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.recipes[0].id).toBeTruthy();
      expect(response.body.data.recipes[0].name).toBeTruthy();
      expect(response.body.data.recipes[0].description).toBeTruthy();
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should return one recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { recipes(id: $id) { id name description createdAt updatedAt } }',
        variables: { id: 1 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.recipes[0].id).toEqual(1);
      expect(response.body.data.recipes[0].name).toEqual('Chocolate Cake');
      expect(response.body.data.recipes[0].description).toEqual(
        'A chocolate cake'
      );
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should successfully create a new recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [{ description: 'Step' }],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createRecipe.id).toEqual(7);
      expect(response.body.data.createRecipe.name).toEqual('New Recipe');
      expect(response.body.data.createRecipe.description).toEqual(
        'A new recipe'
      );
      expect(response.body.data.createRecipe.createdAt).toBeTruthy();
      expect(response.body.data.createRecipe.updatedAt).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing a name', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: '',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [{ description: 'Step' }],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing any ingredients', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [],
            steps: [{ description: 'Step' }],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing any steps', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing any categories', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [{ description: 'Step' }],
            categoriesIds: [],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 4,
          newData: { name: 'The New Name' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateRecipe.id).toEqual(4);
      expect(response.body.data.updateRecipe.name).toEqual('The New Name');
      expect(response.body.data.updateRecipe.description).toEqual(
        'A vanilla pudding recipe'
      );
      expect(response.body.data.updateRecipe.createdAt).toBeTruthy();
      expect(response.body.data.updateRecipe.updatedAt).toBeTruthy();
    });

    it('should fail to update a recipe by not providing new data', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 2,
          newData: { name: '' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a recipe by providing an invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 200,
          newData: { name: 'New Name' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 6 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteRecipe.id).toEqual(6);
      expect(response.body.data.deleteRecipe.name).toEqual('Fried Rice');
      expect(response.body.data.deleteRecipe.description).toEqual(
        'A fried rice recipe'
      );
      expect(response.body.data.deleteRecipe.createdAt).toBeTruthy();
      expect(response.body.data.deleteRecipe.updatedAt).toBeTruthy();
    });

    it('should fail to delete a recipe by providing an invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 34 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('User is cook', () => {
    let cookToken: string;

    beforeAll(async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email } token } }',
        variables: {
          input: { email: 'ulrik@gmail.com', password: 'umeginrat' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      cookToken = response.body.data.loginUser.token;
    });

    it('should return all recipes', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { recipes { id name description createdAt updatedAt } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.recipes[0].id).toBeTruthy();
      expect(response.body.data.recipes[0].name).toBeTruthy();
      expect(response.body.data.recipes[0].description).toBeTruthy();
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should return one recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { recipes(id: $id) { id name description createdAt updatedAt } }',
        variables: { id: 1 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.recipes[0].id).toEqual(1);
      expect(response.body.data.recipes[0].name).toEqual('Chocolate Cake');
      expect(response.body.data.recipes[0].description).toEqual(
        'A chocolate cake'
      );
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should successfully create a new recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'Another Recipe',
            description: 'One more new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [{ description: 'Step' }],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createRecipe.id).toEqual(8);
      expect(response.body.data.createRecipe.name).toEqual('Another Recipe');
      expect(response.body.data.createRecipe.description).toEqual(
        'One more new recipe'
      );
      expect(response.body.data.createRecipe.createdAt).toBeTruthy();
      expect(response.body.data.createRecipe.updatedAt).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing a name', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: '',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [{ description: 'Step' }],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing any ingredients', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [],
            steps: [{ description: 'Step' }],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing any steps', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [],
            categoriesIds: [1],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new recipe by not providing any categories', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: {
            name: 'New Recipe',
            description: 'A new recipe',
            ingredients: [{ description: 'Ingredient', quantity: 1 }],
            steps: [{ description: 'Step' }],
            categoriesIds: [],
          },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 4,
          newData: { name: 'New Name' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateRecipe.id).toEqual(4);
      expect(response.body.data.updateRecipe.name).toEqual('New Name');
      expect(response.body.data.updateRecipe.description).toEqual(
        'A vanilla pudding recipe'
      );
      expect(response.body.data.updateRecipe.createdAt).toBeTruthy();
      expect(response.body.data.updateRecipe.updatedAt).toBeTruthy();
    });

    it('should fail to update a recipe by not providing new data', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 2,
          newData: { name: '' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a recipe by providing an invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 200,
          newData: { name: 'New Name' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update a recipe by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 2,
          newData: { name: 'New Name' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 5 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteRecipe.id).toEqual(5);
      expect(response.body.data.deleteRecipe.name).toEqual('Petit Gateau');
      expect(response.body.data.deleteRecipe.description).toEqual(
        'A petit gateau recipe'
      );
      expect(response.body.data.deleteRecipe.createdAt).toBeTruthy();
      expect(response.body.data.deleteRecipe.updatedAt).toBeTruthy();
    });

    it('should fail to delete a recipe by providing an invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 34 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to delete a recipe by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('User is logged in', () => {
    let userToken: string;

    beforeAll(async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email } token } }',
        variables: {
          input: { email: 'taqqiq@gmail.com', password: 'tberlin' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      userToken = response.body.data.loginUser.token;
    });

    it('should return all recipes', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { recipes { id name description createdAt updatedAt } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.recipes[0].id).toBeTruthy();
      expect(response.body.data.recipes[0].name).toBeTruthy();
      expect(response.body.data.recipes[0].description).toBeTruthy();
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should return one recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { recipes(id: $id) { id name description createdAt updatedAt } }',
        variables: { id: 1 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.recipes[0].id).toEqual(1);
      expect(response.body.data.recipes[0].name).toEqual('Chocolate Cake');
      expect(response.body.data.recipes[0].description).toEqual(
        'A chocolate cake'
      );
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should fail to create a new recipe by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: { name: 'New Recipe', description: 'A new recipe' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a recipe by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 2,
          newData: { name: 'New Name' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete a recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 1 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('User is not logged in', () => {
    it('should return all recipes', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { recipes { id name description createdAt updatedAt } }',
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.recipes[0].id).toBeTruthy();
      expect(response.body.data.recipes[0].name).toBeTruthy();
      expect(response.body.data.recipes[0].description).toBeTruthy();
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should return one recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { recipes(id: $id) { id name description createdAt updatedAt } }',
        variables: { id: 1 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.recipes.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.recipes[0].id).toEqual(1);
      expect(response.body.data.recipes[0].name).toEqual('Chocolate Cake');
      expect(response.body.data.recipes[0].description).toEqual(
        'A chocolate cake'
      );
      expect(response.body.data.recipes[0].createdAt).toBeTruthy();
      expect(response.body.data.recipes[0].updatedAt).toBeTruthy();
    });

    it('should fail to create a new recipe by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewRecipeInput!) { createRecipe(input: $input) { id name description createdAt updatedAt } }',
        variables: {
          input: { name: 'New Recipe', description: 'A new recipe' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a recipe by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateRecipeId: Int!, $newData: UpdateRecipeInput!) { updateRecipe(id: $updateRecipeId, newData: $newData) { id name description createdAt updatedAt } }',
        variables: {
          updateRecipeId: 2,
          newData: { name: 'New Name' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete a recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteRecipeId: Int!) { deleteRecipe(id: $deleteRecipeId) { id name description createdAt updatedAt } }',
        variables: { deleteRecipeId: 1 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });
});
