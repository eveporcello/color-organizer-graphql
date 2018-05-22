const { GraphQLServer } = require("graphql-yoga")
const { GraphQLScalarType } = require("graphql")
const isColor = require("is-color")
const Color = require("color")

const colors = []

const typeDefs = `
    scalar ColorValue

    type Color {
        title: String!
        color: ColorValue
    }

    type Query {
        allColors: [Color!]!
    }

    type Mutation {
        addColor(
            title: String!
            color: ColorValue!
        ): Color!
    }
`

const resolvers = {
  Query: {
    allColors: () => colors
  },
  Mutation: {
    addColor(root, { title, color }) {
      let newColor = {
        title,
        color
      }
      colors.push(newColor)
      return newColor
    }
  },
  ColorValue: new GraphQLScalarType({
    name: "ColorValue",
    description: "A color.",
    parseValue: value =>
      isColor(value)
        ? Color(value).hex()
        : new Error(`invalid hex color value: ${value}`),
    serialize: value => Color(value).hex(),
    parseLiteral: ast => {
      if (!isColor(ast.value)) {
        throw new Error(`invalid hex color value: ${ast.value}`)
      }
      return Color(ast.value).hex()
    }
  })
}

const server = new GraphQLServer({ typeDefs, resolvers })
const options = {
  port: 4000,
  endpoint: "/graphql",
  playground: "/playground"
}
const ready = ({ port }) =>
  console.log(`graph service running - http://localhost:${port}`)
server.start(options, ready)
