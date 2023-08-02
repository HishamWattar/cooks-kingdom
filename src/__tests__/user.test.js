// eslint-disable-next-line import/order
const supertest = require('supertest');
const app = require('../app'); // Import your Express app
const db = require('../db/connection');
const { User } = require('../models/user');

const req = supertest(app);

const { sendApprovalEmail } = require('../utils/email');
// const uploadImage = require('../services/gcs');

jest.mock('../utils/email');
// jest.mock('../services/gcs');
// sendApprovalEmail.mockResolvedValue();
// uploadImage.mockResolvedValue();

let addressId;
let newUserToken;
const newUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  name: 'JohnDoe',
  password: 'Correct$123',
};
beforeAll(async () => {
  await db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(newUser);
  newUser.id = res.body.data._id;
  [newUserToken] = res.headers['set-cookie'][0].split(';');
});

afterAll(async () => {
  await User.deleteMany({});
  await db.closeDatabase();
  jest.clearAllMocks();
});

describe('User Endpoints', () => {
  describe('GET /api/user/me', () => {
    it('should return authenticated user profile', async () => {
      const res = await req.get('/api/user/me').set('Cookie', newUserToken);

      expect(res.statusCode).toBe(200);

      expect(res.body.firstName).toBe(newUser.firstName);
      expect(res.body.lastName).toBe(newUser.lastName);
      expect(res.body.name).toBe(newUser.name);
      expect(res.body.email).toBe(newUser.email);
    });

    it('should return unauthorized error message when user is unauthenticated', async () => {
      const res = await req.get('/api/user/me');

      expect(res.statusCode).toBe(401);

      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('PUT /api/user/profile/role', () => {
    it('should update authenticated user role', async () => {
      // mock admin who will receive an email
      const admin = await User.create({
        firstName: 'admin',
        lastName: 'admin',
        password: 'Admin%123',
        name: 'AdminUser',
        email: 'admin@example.com',
        role: 'admin',
      });
      const res = await req
        .put('/api/user/profile/role')
        .set('Cookie', newUserToken)
        .send({ role: 'chef' });

      // mock sending email because it is a 3rd party service
      // sendApprovalEmail.mockResolvedValueOnce();

      expect(res.statusCode).toBe(200);
      expect(sendApprovalEmail).toHaveBeenCalledTimes(1);
      expect(sendApprovalEmail).toHaveBeenCalledWith(admin.email, newUser.id);
      expect(res.body.message).toBe('Your role has been updated successfully');
    });

    it('should return an error message when role is invalid', async () => {
      // mock admin who will receive an email
      const res = await req
        .put('/api/user/profile/role')
        .set('Cookie', newUserToken)
        .send({ role: 'invalid' });

      expect(res.statusCode).toBe(422);
    });

    it('should return an error message when user already has a role', async () => {
      // mock admin who will receive an email
      const res = await req
        .put('/api/user/profile/role')
        .set('Cookie', newUserToken)
        .send({ role: 'chef' });

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toBe("You can't change your role");
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile and return updated profile', async () => {
      const updatedUserProfile = {
        addresses: [
          {
            city: 'New York',
            country: 'USA',
            street: '123 Main St',
            block: 'A',
            postalCode: '10001',
            apartment: 'Apt 101',
            isDefault: true,
          },
        ],
        firstName: 'Mich',
        experienceYears: 3,
      };

      const res = await req
        .put('/api/user/profile')
        .set('Cookie', newUserToken)
        .send(updatedUserProfile);

      expect(res.statusCode).toBe(200);
      expect(res.body.addresses.length).toBeGreaterThan(0);
      expect(res.body.addresses[0].city).toBe(
        updatedUserProfile.addresses[0].city
      );
      expect(res.body.addresses[0].country).toBe(
        updatedUserProfile.addresses[0].country
      );
      expect(res.body.firstName).toBe(updatedUserProfile.firstName);
      expect(res.body.experienceYears).toBe(updatedUserProfile.experienceYears);

      addressId = res.body.addresses[0]._id;
    });

    it('should return an error message when user tries to set many addresses as default one', async () => {
      const updatedUserProfile = {
        addresses: [
          {
            city: 'Istanbul',
            country: 'Turkey',
            street: '123 Main St',
            block: 'A',
            postalCode: '10001',
            apartment: 'Apt 101',
            isDefault: true,
          },
        ],
      };

      const res = await req
        .put('/api/user/profile')
        .set('Cookie', newUserToken)
        .send(updatedUserProfile);

      expect(res.statusCode).toBe(422);
    });

    it('should return an error message when user pass invalid address', async () => {
      const updatedUserProfile = {
        addresses: [
          {
            city: 'Istanbul',
            isDefault: true,
          },
        ],
      };

      const res = await req
        .put('/api/user/profile')
        .set('Cookie', newUserToken)
        .send(updatedUserProfile);

      expect(res.statusCode).toBe(422);
    });
  });
  describe('PUT /api/user/profile/address/:id', () => {
    it('should update user address by id', async () => {
      const updatedUserAddress = {
        address: {
          city: 'Istanbul',
          street: '321 Main St',
          block: 'C',
        },
      };

      const res = await req
        .put(`/api/user/profile/address/${addressId}`)
        .set('Cookie', newUserToken)
        .send(updatedUserAddress);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Address updated successfully');
    });

    it('should return an error message when address is no exists', async () => {
      const updatedUserAddress = {
        address: {
          city: 'Istanbul',
          street: '321 Main St',
          block: 'C',
        },
      };

      const res = await req
        .put(`/api/user/profile/address/64c51069c583d1f6cd651111`)
        .set('Cookie', newUserToken)
        .send(updatedUserAddress);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Address is not found');
    });

    it('should return an error message when invalid address is passed', async () => {
      const updatedUserAddress = {
        address: {
          city: 'Istanbul32',
          street: '321 Main St',
        },
      };

      const res = await req
        .put(`/api/user/profile/address/${addressId}`)
        .set('Cookie', newUserToken)
        .send(updatedUserAddress);

      expect(res.statusCode).toBe(422);
    });
  });
  // TODO NEEDS A TEST FOR UPLOAD IMAGE
  // describe('PUT /api/user/profile/upload', () => {
  //   it('should update user profile picture', async () => {
  //     const mockImage = {
  //       image: 'mockImage.png',
  //     };
  //     const res = await req
  //       .put(`/api/user/profile/upload`)
  //       .set('Cookie', newUserToken)
  //       .attach(mockImage);
  //
  //     expect(res.statusCode).toBe(200);
  //   });
  // });

  describe('DELETE /api/user/profile/address/:id', () => {
    it('should delete user address by id', async () => {
      const res = await req
        .delete(`/api/user/profile/address/${addressId}`)
        .set('Cookie', newUserToken);

      expect(res.statusCode).toBe(204);
    });
    // it('should return an error message when address is not exists', async () => {
    //   const res = await req
    //       .put(`/api/user/profile/address/${addressId}`)
    //       .set('Cookie', newUserToken);
    //
    //   expect(res.statusCode).toBe(404);
    // });
  });

  describe('DELETE /api/user/profile', () => {
    it('should should deactivate user profile and clear his token', async () => {
      const res = await req
        .delete(`/api/user/profile`)
        .set('Cookie', newUserToken);

      expect(res.statusCode).toBe(204);
      const tokenCookie = res.headers['set-cookie'][0];
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie.includes('token=;')).toBe(true);
    });
  });
});
