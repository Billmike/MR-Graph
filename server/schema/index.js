const graphql = require('graphql');
const Recipes = require('../models/recipe');
const Users = require('../models/users');
const Favorites = require('../models/favorites');
const bycrpt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID,
GraphQLList } = graphql;

const recipes = [
  {
    id: '1',
    name: 'First recipe',
    description: 'First recipe',
    cookTime: '38mins',
    category: 'Lunch',
    ingredients: 'Onions, Rice, Tomatoes',
    instructions: 'Cook properly. Dont wash intermittently',
    ownerId: '1',
  },
  {
    id: '2',
    name: 'Second recipe',
    description: 'Second recipe',
    cookTime: '38mins',
    category: 'Lunch',
    ingredients: 'Onions, Rice, Tomatoes',
    instructions: 'Cook properly. Dont wash intermittently',
    ownerId: '2',
  },
  {
    id: '3',
    name: 'Third recipe',
    description: 'Third recipe',
    cookTime: '38mins',
    category: 'Lunch',
    ingredients: 'Onions, Rice, Tomatoes',
    instructions: 'Cook properly. Dont wash intermittently',
    ownerId: '3',
  }
];

const users = [
  { id: '1', email: 'bill@gmail.com', fullName: 'Bill Giddy' },
  { id: '2', email: 'james@gmail.com', fullName: 'Gandy' },
  { id: '3', email: 'dandy@gmail.com', fullName: 'Dandy Lion' }
];

const favorites = [
  { id: '1', recipeId: '1', email: 'bill@gmail.com', fullName: 'Bill Giddy' },
  { id: '2', recipeId: '1', email: 'james@gmail.com', fullName: 'Gandy' },
  { id: '3', recipeId: '2', email: 'dandy@gmail.com', fullName: 'Dandy Lion' },
  { id: '4', recipeId: '3', email: 'james@gmail.com', fullName: 'Gandy' },
  { id: '5', recipeId: '2', email: 'dandy@gmail.com', fullName: 'Dandy Lion' },
  { id: '6', recipeId: '3', email: 'bill@gmail.com', fullName: 'Bill Giddy' },
]

const RecipeType = new GraphQLObjectType({
  name: 'Recipe',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    cookTime: { type: GraphQLString },
    category: { type: GraphQLString },
    ingredients: { type: GraphQLString },
    instructions: { type: GraphQLString },
    owner: {
      type: UserType,
      resolve(parent, args) {
        return Users.findById(parent.ownerId)
      }
    },
    favorites: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return Favorites.find({ recipeId: parent.id })
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    fullName: { type: GraphQLString },
    password: { type: GraphQLString },
    token: { type: GraphQLString },
    recipes: {
      type: new GraphQLList(RecipeType),
      resolve(parent, args) {
        return Recipes.find({ ownerId: parent.id })
      }
    }
  })
})

const FavoriteType = new GraphQLObjectType({
  name: 'Favorite',
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    fullName: { type: GraphQLString },
    recipeId: { type: GraphQLID }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    recipe: {
      type: RecipeType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args) {
        // fetch from DB later
        return Recipes.findById(args.id)
      }
    },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args) {
        return Users.findById(args.id)
      }
    },
    recipes: {
      type: new GraphQLList(RecipeType),
      resolve(parent, args) {
        return Recipes.find({})
      }
    },
    owners: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return Users.find({})
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    userSignup: {
      type: UserType,
      args: {
        fullName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async(parent, args) => {
        const user = await Users.findOne({ email: args.email });
        if (user) {
          return 'Email already exists'
        }
        const salt = bycrpt.genSaltSync(10)
        const hashedPassword = bycrpt.hashSync(args.password, salt);
        const newUser = new Users({
          fullName: args.fullName,
          email: args.email,
          password: hashedPassword
        });
        await newUser.save()
        const registeredUser = await Users.findOne({ email: args.email })
        registeredUser.token = jwt.sign({
          id: registeredUser._id,
          email: registeredUser.email,
          fullName: registeredUser.fullName
        }, process.env.SECRET, { expiresIn: '1hr' });
        return registeredUser
      }
    },
    userSignin: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async (parent, args) => {
        const user = await Users.findOne({ email: args.email });
        const unHashedPassword = bycrpt.compareSync(args.password, user.password);
        if (!unHashedPassword) return 'Invalid email and password combination';
        const token = jwt.sign({
          _id: user._id,
          email: user.email,
          fullName: user.fullName
        }, process.env.SECRET, { expiresIn: '12hr' });
        const signedUser = {
          fullName: user.fullName,
          email: user.email,
          token
        };
        return signedUser;
      }
    },
    addRecipe: {
      type: RecipeType,
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
        cookTime: { type: GraphQLString },
        ingredients: { type: GraphQLString },
        instructions: { type: GraphQLString },
        ownerId: { type: GraphQLString }
      },
      resolve(parent, args) {
        let recipe = new Recipes({
          name: args.name,
          description: args.description,
          category: args.category,
          cookTime: args.cookTime,
          ingredients: args.ingredients,
          instructions: args.instructions,
          ownerId: args.ownerId
        });
        return recipe.save()
      }
    },
    addFavorite: {
      type: FavoriteType,
      args: {
        recipeId: { type: GraphQLID },
        email: { type: GraphQLString },
        fullName: { type: GraphQLString },
      },
      resolve(parent, args) {
        let favorite = new Favorites({
          recipeId: args.recipeId,
          email: args.email,
          fullName: args.fullName
        });
        return favorite.save();
      }
    },
    editRecipe: {
      type: RecipeType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
        cookTime: { type: GraphQLString },
        ingredients: { type: GraphQLString },
        instructions: { type: GraphQLString },
      },
      resolve(parent, args) {
        const query = { _id: args.id };
        const update = {
          name: args.name,
          description: args.description,
          category: args.category,
          cookTime: args.cookTime,
          ingredients: args.ingredients,
          instructions: args.instructions
        }
        const updateRecipe = Recipes.findOneAndUpdate(query, {$set: update}, {new: true});
        return updateRecipe;
      }
    },
    deleteRecipe: {
      type: RecipeType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args) {
        return Recipes.deleteOne({ _id: args.id });
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})