import typeDefs from '../schema';
import resolvers from '../resolvers';
import createrServer from '../app';
import request from 'supertest';
import { Server } from 'http';
import { GraphQLRequest } from 'apollo-server-types';

describe('Reviews Mutations', () => {
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

    it('should return all reviews', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { reviews { id title text rating createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.reviews[0].id).toBeTruthy();
      expect(response.body.data.reviews[0].title).toBeTruthy();
      expect(response.body.data.reviews[0].text).toBeTruthy();
      expect(response.body.data.reviews[0].rating).toBeTruthy();
      expect(response.body.data.reviews[0].createdAt).toBeTruthy();
      expect(response.body.data.reviews[0].updatedAt).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.id).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.name).toBeTruthy();
    });

    it('should return one review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { reviews(id: $id) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { id: 1 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.reviews[0].id).toEqual(1);
      expect(response.body.data.reviews[0].title).toEqual(
        'Great chocolate cake recipe!'
      );
      expect(response.body.data.reviews[0].text).toEqual('Great recipe!');
      expect(response.body.data.reviews[0].rating).toEqual(5);
      expect(response.body.data.reviews[0].createdAt).toBeTruthy();
      expect(response.body.data.reviews[0].updatedAt).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.id).toEqual(1);
      expect(response.body.data.reviews[0].recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should successfully create a new review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 3,
          review: { title: 'Average recipe', text: "It's okay", rating: 3 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createReview.id).toEqual(6);
      expect(response.body.data.createReview.title).toEqual('Average recipe');
      expect(response.body.data.createReview.text).toEqual("It's okay");
      expect(response.body.data.createReview.rating).toEqual(3);
      expect(response.body.data.createReview.createdAt).toBeTruthy();
      expect(response.body.data.createReview.updatedAt).toBeTruthy();
      expect(response.body.data.createReview.recipe.id).toEqual(3);
      expect(response.body.data.createReview.recipe.name).toEqual(
        'Chicken Stir Fry'
      );
    });

    it('should fail to create a review by already having a review for the recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          review: { title: 'Average recipe', text: "It's okay", rating: 3 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new review by not providing the title', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 2,
          review: { title: '', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new review by providing an invalid review id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 20,
          review: { title: 'New Review', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 3,
          newData: { title: 'New Title' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateReview.id).toEqual(3);
      expect(response.body.data.updateReview.title).toEqual('New Title');
      expect(response.body.data.updateReview.text).toEqual(
        "This recipe doesn't make any sense"
      );
      expect(response.body.data.updateReview.rating).toEqual(1);
      expect(response.body.data.updateReview.createdAt).toBeTruthy();
      expect(response.body.data.updateReview.updatedAt).toBeTruthy();
      expect(response.body.data.updateReview.recipe.id).toEqual(2);
      expect(response.body.data.updateReview.recipe.name).toEqual(
        'French Crepes'
      );
    });

    it('should fail to update a review by not providing any new data', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 2,
          newData: { title: '' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a review by providing an invalid review id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 30,
          newData: { title: 'New Title' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteReviewId: Int!) { deleteReview(id: $deleteReviewId) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { deleteReviewId: 5 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteReview.id).toEqual(5);
      expect(response.body.data.deleteReview.title).toEqual(
        'This recipe is amazaing'
      );
      expect(response.body.data.deleteReview.text).toEqual(
        'This is the best chocolate cake recipe available'
      );
      expect(response.body.data.deleteReview.rating).toEqual(5);
      expect(response.body.data.deleteReview.createdAt).toBeTruthy();
      expect(response.body.data.deleteReview.updatedAt).toBeTruthy();
      expect(response.body.data.deleteReview.recipe.id).toEqual(1);
      expect(response.body.data.deleteReview.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to delete a review by providing an invalid review id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteReviewId: Int!) { deleteReview(id: $deleteReviewId) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { deleteReviewId: 30 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
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

    it('should return all reviews', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { reviews { id title text rating createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.reviews[0].id).toBeTruthy();
      expect(response.body.data.reviews[0].title).toBeTruthy();
      expect(response.body.data.reviews[0].text).toBeTruthy();
      expect(response.body.data.reviews[0].rating).toBeTruthy();
      expect(response.body.data.reviews[0].createdAt).toBeTruthy();
      expect(response.body.data.reviews[0].updatedAt).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.id).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.name).toBeTruthy();
    });

    it('should return one review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { reviews(id: $id) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { id: 1 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.reviews[0].id).toEqual(1);
      expect(response.body.data.reviews[0].title).toEqual(
        'Great chocolate cake recipe!'
      );
      expect(response.body.data.reviews[0].text).toEqual('Great recipe!');
      expect(response.body.data.reviews[0].rating).toEqual(5);
      expect(response.body.data.reviews[0].createdAt).toBeTruthy();
      expect(response.body.data.reviews[0].updatedAt).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.id).toEqual(1);
      expect(response.body.data.reviews[0].recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should successfully create a new review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 3,
          review: { title: 'New Review', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.createReview.id).toEqual(7);
      expect(response.body.data.createReview.title).toEqual('New Review');
      expect(response.body.data.createReview.text).toEqual('Text');
      expect(response.body.data.createReview.rating).toEqual(4);
      expect(response.body.data.createReview.createdAt).toBeTruthy();
      expect(response.body.data.createReview.updatedAt).toBeTruthy();
      expect(response.body.data.createReview.recipe.id).toEqual(3);
      expect(response.body.data.createReview.recipe.name).toEqual(
        'Chicken Stir Fry'
      );
    });

    it('should fail to create a new review by already having a review for the recipe', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          review: { title: 'New Review', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new review by not providing the title', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          review: { title: '', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new review by providing an invalid review id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 20,
          review: { title: 'New Review', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully update a review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 2,
          newData: { title: 'New Title' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateReview.id).toEqual(2);
      expect(response.body.data.updateReview.title).toEqual('New Title');
      expect(response.body.data.updateReview.text).toEqual(
        'This is a good recipe'
      );
      expect(response.body.data.updateReview.rating).toEqual(4);
      expect(response.body.data.updateReview.createdAt).toBeTruthy();
      expect(response.body.data.updateReview.updatedAt).toBeTruthy();
      expect(response.body.data.updateReview.recipe.id).toEqual(2);
      expect(response.body.data.updateReview.recipe.name).toEqual(
        'French Crepes'
      );
    });

    it('should fail to update a review by not providing any new data', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 2,
          newData: { title: '' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a review by providing an invalid review id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 30,
          newData: { title: 'New Title' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update a review by not being the reviews's creator", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 3,
          newData: { title: 'New Title' },
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully delete a review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteReviewId: Int!) { deleteReview(id: $deleteReviewId) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { deleteReviewId: 4 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteReview.id).toEqual(4);
      expect(response.body.data.deleteReview.title).toEqual('Good recipe!');
      expect(response.body.data.deleteReview.text).toEqual(
        'Delicious chocolate cake'
      );
      expect(response.body.data.deleteReview.rating).toEqual(5);
      expect(response.body.data.deleteReview.createdAt).toBeTruthy();
      expect(response.body.data.deleteReview.updatedAt).toBeTruthy();
      expect(response.body.data.deleteReview.recipe.id).toEqual(1);
      expect(response.body.data.deleteReview.recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to delete a review by providing an invalid review id', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteReviewId: Int!) { deleteReview(id: $deleteReviewId) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { deleteReviewId: 30 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to delete a review by not being the review's creator", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteReviewId: Int!) { deleteReview(id: $deleteReviewId) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { deleteReviewId: 1 },
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
    it('should return all reviews', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query { reviews { id title text rating createdAt updatedAt recipe { id name } } }',
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.reviews[0].id).toBeTruthy();
      expect(response.body.data.reviews[0].title).toBeTruthy();
      expect(response.body.data.reviews[0].text).toBeTruthy();
      expect(response.body.data.reviews[0].rating).toBeTruthy();
      expect(response.body.data.reviews[0].createdAt).toBeTruthy();
      expect(response.body.data.reviews[0].updatedAt).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.id).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.name).toBeTruthy();
    });

    it('should return one review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { reviews(id: $id) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { id: 1 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.reviews[0].id).toEqual(1);
      expect(response.body.data.reviews[0].title).toEqual(
        'Great chocolate cake recipe!'
      );
      expect(response.body.data.reviews[0].text).toEqual('Great recipe!');
      expect(response.body.data.reviews[0].rating).toEqual(5);
      expect(response.body.data.reviews[0].createdAt).toBeTruthy();
      expect(response.body.data.reviews[0].updatedAt).toBeTruthy();
      expect(response.body.data.reviews[0].recipe.id).toEqual(1);
      expect(response.body.data.reviews[0].recipe.name).toEqual(
        'Chocolate Cake'
      );
    });

    it('should fail to create a new review by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($recipeId: Int!, $review: NewReviewInput!) { createReview(recipeId: $recipeId, review: $review) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          recipeId: 1,
          review: { title: 'New Review', text: 'Text', rating: 4 },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to update a review by being unauthorized', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($updateReviewId: Int!, $newData: UpdateReviewInput!) { updateReview(id: $updateReviewId, newData: $newData) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: {
          updateReviewId: 2,
          newData: { title: 'New Title' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete a review', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteReviewId: Int!) { deleteReview(id: $deleteReviewId) { id title text rating createdAt updatedAt recipe { id name } } }',
        variables: { deleteReviewId: 1 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });
});
