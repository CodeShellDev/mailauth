import logger from "#utils/logger"
import config from "#utils/config"

import { MongoClient } from "mongodb"
import { createClient } from "redis"

let mongoClient, mongoSession
let redisClient

export async function Init() {
	mongoClient = new MongoClient(config.DB_URI)

	await mongoClient.connect()

	logger.debug("Connected to MongoDB")

	mongoSession = mongoClient.startSession()

	logger.debug("Started MongoDB Session")

	redisClient = createClient({ url: config.REDIS_URI })

	await redisClient.connect()

	logger.debug("Connected to Redis")
}

export async function Close() {
	logger.debug("Closing MongoDB Connection")

	await mongoSession.endSession()
	await mongoClient.close()
}

export function Connect() {
	return mongoClient.db(config.DB_NAME)
}

// Mongo

export async function FindBy(collectionName, query) {
	const db = await Connect()

	const collection = db.collection(collectionName)

	return collection.findOne(query)
}

export async function FindOrCreate(collectionName, query, data = {}) {
	const db = await Connect()

	const collection = db.collection(collectionName)

	return collection.findOneAndUpdate(
		query,
		{
			$setOnInsert: data,
		},
		{
			upsert: true,
			returnDocument: "after",
		},
	)
}

export async function AddToArray(collectionName, query, update) {
	const db = await Connect()

	const collection = db.collection(collectionName)

	return collection.updateOne(query, { $addToSet: update })
}

export async function DeleteFromArrayBy(collectionName, query, update) {
	const db = await Connect()

	const collection = db.collection(collectionName)

	return collection.updateOne(query, { $pull: update })
}

export async function UpdateBy(collectionName, query, update) {
	const db = await Connect()

	const collection = db.collection(collectionName)

	return collection.updateOne(query, { $set: update })
}

// REDIS

export async function GetFromCache(key) {
	const value = await redisClient.get(key)

	if (value === null) {
		return null
	}

	try {
		return JSON.parse(value)
	} catch {
		return value
	}
}

export async function WriteToCache(key, value, ttl = 3600) {
	if (typeof value !== "string") {
		value = JSON.stringify(value)
	}

	await redisClient.set(key, value)
	await redisClient.expire(key, ttl)
}

export async function DeleteFromCache(key) {
	await redisClient.del(key)
}

export function GetMongoDB() {
	return mongoClient
}

export function GetRedis() {
	return redisClient
}
