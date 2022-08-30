import typeDefs from '../schema';
import resolvers from '../resolvers';
import createrServer from '../app';
import request from 'supertest';
import { Server } from 'http';
import { GraphQLRequest } from 'apollo-server-types';

describe('Steps Mutations', () => {
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

    it('should return all steps', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { steps { id description createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should return one step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { steps(id: $id) { id description createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toEqual(1);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should successfully create a new step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 1, description: 'New step' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createStep.id).toBeTruthy();
      expect(response.body.data.createStep.description).toEqual('New step');
      expect(response.body.data.createStep.createdAt).toBeTruthy();
      expect(response.body.data.createStep.updatedAt).toBeTruthy();
      expect(response.body.data.createStep.recipe.id).toEqual(1);
      expect(response.body.data.createStep.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to create a new step by not providing a description', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 1, description: '' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new step by providing a invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 20, description: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 2, newDescription: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateStep.id).toEqual(2);
      expect(response.body.data.updateStep.description).toEqual(
        'New description'
      );
      expect(response.body.data.updateStep.createdAt).toBeTruthy();
      expect(response.body.data.updateStep.updatedAt).toBeTruthy();
      expect(response.body.data.updateStep.recipe.id).toEqual(1);
      expect(response.body.data.updateStep.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to update a step by not providing the new description', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 3, newDescription: '' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a step by providing an invalid step id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 20, newDescription: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 8 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteStep.id).toEqual(8);
      expect(response.body.data.deleteStep.description).toEqual(
        'Cut the chicken breast into thin strips'
      );
      expect(response.body.data.deleteStep.createdAt).toBeTruthy();
      expect(response.body.data.deleteStep.updatedAt).toBeTruthy();
      expect(response.body.data.deleteStep.recipe.id).toEqual(3);
      expect(response.body.data.deleteStep.recipe.name).toEqual(
        'Chicken Stir Fry'
      );
    });

    it('should fail to delete a step by providing an invalid step id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 22 },
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

    it('should return all steps', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { steps { id description createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should return one step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { steps(id: $id) { id description createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toEqual(1);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should successfully create a new step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 1, description: 'New step' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createStep.id).toBeTruthy();
      expect(response.body.data.createStep.description).toEqual('New step');
      expect(response.body.data.createStep.createdAt).toBeTruthy();
      expect(response.body.data.createStep.updatedAt).toBeTruthy();
      expect(response.body.data.createStep.recipe.id).toEqual(1);
      expect(response.body.data.createStep.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail create a new step by not providing a description', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 1, description: '' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail create a new step by providing a invalid recipe id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 20, description: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail create a new step by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 2, description: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 4, newDescription: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateStep.id).toEqual(4);
      expect(response.body.data.updateStep.description).toEqual(
        'New description'
      );
      expect(response.body.data.updateStep.createdAt).toBeTruthy();
      expect(response.body.data.updateStep.updatedAt).toBeTruthy();
      expect(response.body.data.updateStep.recipe.id).toEqual(1);
      expect(response.body.data.updateStep.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to update a step by not providing the new description', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 3, newDescription: '' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a step by providing an invalid step id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 50, newDescription: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update a step by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 6, newDescription: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 10 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteStep.id).toEqual(10);
      expect(response.body.data.deleteStep.description).toEqual(
        'Add the red chillis'
      );
      expect(response.body.data.deleteStep.createdAt).toBeTruthy();
      expect(response.body.data.deleteStep.updatedAt).toBeTruthy();
      expect(response.body.data.deleteStep.recipe.id).toEqual(3);
      expect(response.body.data.deleteStep.recipe.name).toEqual(
        'Chicken Stir Fry'
      );
    });

    it('should fail to delete a step by providing an invalid step id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 22 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: cookToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to delete a step by not being the recipe's owner", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 6 },
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

    it('should return all steps', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { steps { id description createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should return one step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { steps(id: $id) { id description createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toEqual(1);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should fail to create a new step by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 1, description: 'New step' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a step by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 4, newDescription: 'New description' },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete a step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 3 },
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
    it('should return all steps', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { steps { id description createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should return one step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { steps(id: $id) { id description createdAt updatedAt recipe { id name } } }',
        variables: { id: 2 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.steps.length).toEqual(1);
      expect(response.body.data.steps[0].id).toBeTruthy();
      expect(response.body.data.steps[0].description).toBeTruthy();
      expect(response.body.data.steps[0].createdAt).toBeTruthy();
      expect(response.body.data.steps[0].updatedAt).toBeTruthy();
      expect(response.body.data.steps[0].recipe.id).toBeTruthy();
      expect(response.body.data.steps[0].recipe.name).toBeTruthy();
    });

    it('should fail to create a new step by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $description: String!) { createStep(recipeId: $recipeId, description: $description) { id description createdAt updatedAt recipe { id name } } }',
        variables: { recipeId: 1, description: 'New step' },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a step by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateStepId: Int!, $newDescription: String!) { updateStep(id: $updateStepId, newDescription: $newDescription) { id description createdAt updatedAt recipe { id name } } }',
        variables: { updateStepId: 4, newDescription: 'New description' },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete a step', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteStepId: Int!) { deleteStep(id: $deleteStepId) { id description createdAt updatedAt recipe { id name } } }',
        variables: { deleteStepId: 3 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });
});
