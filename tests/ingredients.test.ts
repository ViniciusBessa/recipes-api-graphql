import typeDefs from '../schema';
import resolvers from '../resolvers';
import createrServer from '../app';
import request from 'supertest';
import { Server } from 'http';
import { GraphQLRequest } from 'apollo-server-types';

describe('Ingredients Mutations', () => {
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

    it('should return all ingredients', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { ingredients { id description quantity createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toBeTruthy();
      expect(response.body.data.ingredients[0].quantity).toBeTruthy();
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should return one ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { ingredients(id: $id) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toEqual(
        'Cup of sugar'
      );
      expect(response.body.data.ingredients[0].quantity).toEqual(2);
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should successfully create a new ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          ingredientInput: { description: 'New ingredient', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createIngredient.id).toBeTruthy();
      expect(response.body.data.createIngredient.description).toEqual(
        'New ingredient'
      );
      expect(response.body.data.createIngredient.quantity).toEqual(2);
      expect(response.body.data.createIngredient.createdAt).toBeTruthy();
      expect(response.body.data.createIngredient.updatedAt).toBeTruthy();
      expect(response.body.data.createIngredient.recipe.id).toBeTruthy();
      expect(response.body.data.createIngredient.recipe.name).toBeTruthy();
    });

    it('should fail to create a new ingredient by not providing the description', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          ingredientInput: { description: '', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new ingredient by providing an invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description createdAt updatedAt quantity recipe { id name } } }',
        variables: {
          recipeId: 20,
          ingredientInput: { description: 'New description', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update an ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 3,
          newData: { description: 'New ingredient', quantity: 5 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateIngredient.id).toEqual(3);
      expect(response.body.data.updateIngredient.description).toEqual(
        'New ingredient'
      );
      expect(response.body.data.updateIngredient.quantity).toEqual(5);
      expect(response.body.data.updateIngredient.createdAt).toBeTruthy();
      expect(response.body.data.updateIngredient.updatedAt).toBeTruthy();
      expect(response.body.data.updateIngredient.recipe.id).toEqual(2);
      expect(response.body.data.updateIngredient.recipe.name).toEqual(
        'French Crepes'
      );
    });

    it('should fail to update an ingredient by not providing a new description or quantity', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 1,
          newData: { description: '' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update an ingredient by providing an invalid ingredient id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 63,
          newData: { description: 'New description', quantity: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete an ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 5 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteIngredient.id).toEqual(5);
      expect(response.body.data.deleteIngredient.description).toEqual(
        '1/2 cup of milk'
      );
      expect(response.body.data.deleteIngredient.quantity).toEqual(1);
      expect(response.body.data.deleteIngredient.createdAt).toBeTruthy();
      expect(response.body.data.deleteIngredient.updatedAt).toBeTruthy();
      expect(response.body.data.deleteIngredient.recipe.id).toEqual(2);
      expect(response.body.data.deleteIngredient.recipe.name).toEqual(
        'French Crepes'
      );
    });

    it('should fail to delete an ingredient by providing an invalid ingredient id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 23 },
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

    it('should return all ingredients', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { ingredients { id description quantity createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toBeTruthy();
      expect(response.body.data.ingredients[0].quantity).toBeTruthy();
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should return one ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { ingredients(id: $id) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toEqual(
        'Cup of sugar'
      );
      expect(response.body.data.ingredients[0].quantity).toEqual(2);
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should successfully create a new ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          ingredientInput: { description: 'New ingredient', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createIngredient.id).toBeTruthy();
      expect(response.body.data.createIngredient.description).toEqual(
        'New ingredient'
      );
      expect(response.body.data.createIngredient.quantity).toEqual(2);
      expect(response.body.data.createIngredient.createdAt).toBeTruthy();
      expect(response.body.data.createIngredient.updatedAt).toBeTruthy();
      expect(response.body.data.createIngredient.recipe.id).toBeTruthy();
      expect(response.body.data.createIngredient.recipe.name).toBeTruthy();
    });

    it('should fail to create a new ingredient by not providing the description', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          ingredientInput: { description: '', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new ingredient by providing an invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description createdAt updatedAt quantity recipe { id name } } }',
        variables: {
          recipeId: 20,
          ingredientInput: { description: 'New description', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to create a new ingredient by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 2,
          ingredientInput: { description: 'New description', quantity: 1 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update an ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 1,
          newData: { description: 'New ingredient' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateIngredient.id).toEqual(1);
      expect(response.body.data.updateIngredient.description).toEqual(
        'New ingredient'
      );
      expect(response.body.data.updateIngredient.quantity).toEqual(1);
      expect(response.body.data.updateIngredient.createdAt).toBeTruthy();
      expect(response.body.data.updateIngredient.updatedAt).toBeTruthy();
      expect(response.body.data.updateIngredient.recipe.id).toEqual(1);
      expect(response.body.data.updateIngredient.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to update an ingredient by not providing a new description or quantity', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 1,
          newData: { description: '', quantity: 0 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update an ingredient by providing an invalid ingredient id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 40,
          newData: { description: 'New description', quantity: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update an ingredient by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 4,
          newData: { description: 'New description', quantity: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete an ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 6 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteIngredient.id).toEqual(6);
      expect(response.body.data.deleteIngredient.description).toEqual(
        '300g of chicken breast'
      );
      expect(response.body.data.deleteIngredient.quantity).toEqual(3);
      expect(response.body.data.deleteIngredient.createdAt).toBeTruthy();
      expect(response.body.data.deleteIngredient.updatedAt).toBeTruthy();
      expect(response.body.data.deleteIngredient.recipe.id).toEqual(3);
      expect(response.body.data.deleteIngredient.recipe.name).toEqual(
        'Chicken Stir Fry'
      );
    });

    it('should fail to delete an ingredient by providing an invalid ingredient id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 23 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to delete an ingredient by not being the recipes's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 4 },
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

    it('should return all ingredients', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { ingredients { id description quantity createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toBeTruthy();
      expect(response.body.data.ingredients[0].quantity).toBeTruthy();
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should return one ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { ingredients(id: $id) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toEqual(
        'Cup of sugar'
      );
      expect(response.body.data.ingredients[0].quantity).toEqual(2);
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should fail to create a new ingredient by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          ingredientInput: { description: 'New ingredient', quantity: 2 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update an ingredient by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 4,
          newData: { description: 'New ingredient' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete an ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 3 },
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
    it('should return all ingredients', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { ingredients { id description quantity createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toBeTruthy();
      expect(response.body.data.ingredients[0].quantity).toBeTruthy();
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should return one ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { ingredients(id: $id) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.ingredients.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.ingredients[0].id).toBeTruthy();
      expect(response.body.data.ingredients[0].description).toEqual(
        'Cup of sugar'
      );
      expect(response.body.data.ingredients[0].quantity).toEqual(2);
      expect(response.body.data.ingredients[0].createdAt).toBeTruthy();
      expect(response.body.data.ingredients[0].updatedAt).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.id).toBeTruthy();
      expect(response.body.data.ingredients[0].recipe.name).toBeTruthy();
    });

    it('should fail to create a new ingredient by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $ingredientInput: NewIngredientInput!) { createIngredient(recipeId: $recipeId, ingredientInput: $ingredientInput) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          ingredientInput: { description: 'New ingredient', quantity: 2 },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update an ingredient by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateIngredientId: Int!, $newData: UpdateIngredientInput!) { updateIngredient(id: $updateIngredientId, newData: $newData) { id description quantity createdAt updatedAt recipe { id name } } }',
        variables: {
          updateIngredientId: 4,
          newData: { description: 'New ingredient' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete an ingredient', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteIngredientId: Int!) { deleteIngredient(id: $deleteIngredientId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteIngredientId: 3 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });
});
