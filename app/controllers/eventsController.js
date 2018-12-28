const logger = require('../../config/winston.js')
const Event = require('../models/Event.js')
const Cup = require('../models/Cup.js')
const Cluster = require('../models/Cluster.js')
const venueController = require('./venueController.js')
const { check, validationResult } = require('express-validator/check')

exports.validate = [
  check('name')
    .not().isEmpty().withMessage('Event name is missing'),
  check('cluster')
    .isIn(['Culturals', 'Lits', 'Dramatics', 'Videography', 'Sports', 'Miscellaneous', 'Gaming', 'Arts']).withMessage('Select an appropriate cluster'),
  check('cup')
    .isIn(['Culturals', 'Sports', 'Spectrum']).withMessage('Select appropriate cup'),
  check('points')
    .custom(async (points) => {
      if (Number(points[0]) === 0 || Number(points[1]) === 0 || Number(points[2]) === 0) { throw new Error('Enter points to be allotted to at least 3 winners') } else { return true }
    }),
  check('venue')
    .exists().withMessage('Venue is missing')
    .custom(async (venue) => {
      const venueData = await venueController.getVenues()
      const venueIDs = venueData.map(v => v._id.toString())
      if (!venueIDs.includes(venue)) {
        throw new Error('Venue data incorrect')
      } else {
        return true
      }
    }),
  check('description')
    .not().isEmpty().withMessage('Description is missing'),
  check('rules')
    .not().isEmpty().withMessage('Rules is missing'),
  check('date')
    .not().isEmpty().withMessage('Date is missing'),
  check('startTime')
    .not().isEmpty().withMessage('Start time is missing'),
  check('endTime')
    .not().isEmpty().withMessage('End time is missing')
]

exports.createEventForm = async (req, res) => {
  try {
    const venueData = await venueController.getVenues()
    const clusterData = await Cluster.find({}).exec()
    const clusterNames = clusterData.map(cluster => cluster.name)
    const cupData = await Cup.find({}).exec()
    const cupNames = cupData.map(cup => cup.name)
    res.render('auth/admin/eventAdd', {
      data: {
        rollno: req.session.rollnumber,
        venues: venueData,
        clusters: clusterNames,
        cups: cupNames
      },
      title: 'Event Create'
    })
  } catch (err) {
    logger.error(err)
    res.status(500).send(err)
  }
}

exports.editEventForm = async (req, res) => {
  try {
    const venueData = await venueController.getVenues()
    const clusterData = await Cluster.find({}).exec()
    const clusterNames = clusterData.map(cluster => cluster.name)
    const cupData = await Cup.find({}).exec()
    const cupNames = cupData.map(cup => cup.name)
    const EventtoEdit = await Event.findById(req.params.id)
    res.render('auth/admin/eventEdit', {
      data: {
        rollno: req.session.rollnumber,
        venues: venueData,
        venue: EventtoEdit.venue,
        _id: EventtoEdit._id,
        eventName: EventtoEdit.name,
        clusters: clusterNames,
        cups: cupNames,
        cluster: EventtoEdit.cluster,
        cup: EventtoEdit.cup,
        description: EventtoEdit.description,
        rules: EventtoEdit.rules,
        date: EventtoEdit.date,
        startTime: EventtoEdit.startTime,
        endTime: EventtoEdit.endTime,
        places: EventtoEdit.places,
        points: EventtoEdit.points
      },
      title: 'Event Edit'
    })
  } catch (err) {
    logger.error(err)
    res.status(500).send(err)
  }
}

exports.saveEventData = async (req, res) => {
  const errors = validationResult(req).array()
  if (errors.length) {
    const errorMessages = errors.map(error => error.msg)
    logger.error({ user: req.session.user, errors: errorMessages })
    const venueData = await venueController.getVenues()
    const clusterData = await Cluster.find({}).exec()
    const clusterNames = clusterData.map(cluster => cluster.name)
    const cupData = await Cup.find({}).exec()
    const cupNames = cupData.map(cup => cup.name)
    let data = req.body
    data.venues = venueData
    data.clusters = clusterNames
    data.cups = cupNames
    res.render('auth/admin/eventAdd', {
      data: data,
      error: errorMessages,
      title: 'Error page'
    })
  } else {
    try {
      let newEvent = new Event()
      newEvent.name = req.body.name
      newEvent.cluster = req.body.cluster
      newEvent.cup = req.body.cup
      newEvent.description = req.body.description
      newEvent.rules = req.body.rules
      newEvent.date = req.body.date
      newEvent.startTime = req.body.startTime
      newEvent.endTime = req.body.endTime
      for (let i = 0; i < req.body.places; i++) { newEvent.points[i] = req.body.points[i] }
      newEvent.venue = req.body.venue
      newEvent.places = req.body.places
      newEvent.save().then(() => {
        logger.info(`Event ${req.body.name} has been created by ${req.session.user}`)
        res.redirect('admin/events')
      })
    } catch (err) {
      logger.error(err)
      res.status(500).send(err)
    }
  }
}

exports.deleteEventData = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id).exec()
    logger.info(`Event ${req.params.id} deleted by ${req.session.user}`)
  } catch (err) {
    logger.error(err)
    res.status(500).send(err)
  }
}

exports.editEventData = async (req, res) => {
  const errors = validationResult(req).array()
  if (errors.length) {
    const errorMessages = errors.map(error => error.msg)
    logger.error({ user: req.session.user, errors: errorMessages })
    const venueData = await venueController.getVenues()
    const clusterData = await Cluster.find({}).exec()
    const clusterNames = clusterData.map(cluster => cluster.name)
    const cupData = await Cup.find({}).exec()
    const cupNames = cupData.map(cup => cup.name)
    let data = req.body
    data.venues = venueData
    data.clusters = clusterNames
    data.cups = cupNames
    res.render('auth/admin/eventEdit', {
      data: data,
      error: errorMessages,
      title: 'Error page'
    })
  } else {
    try {
      const EventtoEdit = await Event.findById(req.params.id)
      EventtoEdit.name = req.body.name
      EventtoEdit.cluster = req.body.cluster
      EventtoEdit.cup = req.body.cup
      EventtoEdit.description = req.body.description
      EventtoEdit.rules = req.body.rules
      EventtoEdit.date = req.body.date
      EventtoEdit.startTime = req.body.startTime
      EventtoEdit.endTime = req.body.endTime
      EventtoEdit.places = req.body.places
      for (let i = 0; i < req.body.places; i++) { EventtoEdit.points[i] = req.body.points[i] }
      EventtoEdit.venue = req.body.venue
      EventtoEdit.save().then(() => {
        logger.info(`Event ${req.params.id} edited by ${req.session.user}`)
        res.redirect('admin/events')
      })
    } catch (err) {
      logger.error(err)
      res.status(500).send(err)
    }
  }
}