const { Reply, Tweet, User, Like, Sequelize } = require('../models')
const { Op } = Sequelize

const tweetController = {
  getTweets: async (req, res, next) => {
    //登入者追蹤的人的tweets(reply、likes)、本人資訊
    try {
/*       let user = await User.findByPk(req.user.id, {
        include: [
          { model: User, as: 'Followers', attributes: ['id'] },
        ]
      })
      let followers = user.Followers.map(user => { return user.id }) */
      let tweets = await Tweet.findAll({
        attributes: [
          ['id', 'TweetId'], 'createdAt','description',
          [Sequelize.literal('count(distinct Likes.id)'), 'LikesCount'],
          [Sequelize.literal('count(distinct Replies.id)'), 'RepliesCount'],
        ],
        group: 'TweetId',
       /*  where: { UserId: followers }, */
        include: [
          { model: Like, attributes: [] },
          { model: Reply, attributes: [] },
          { model: User, attributes: ['id', 'name', 'avatar','account'] }
        ],
        order:[['createdAt', 'DESC']]
      })
      console.log(tweets)
      
      return res.status(200).json(tweets)
    } catch (err) {
      next(err)
    }
  },
  getTweet: async (req, res, next) => {
    try {
      const { id } = req.params
      let tweet = await Tweet.findByPk(id,
        { include: [User, Like, Reply] }
      )

      if (!tweet) {
        return res.status(409).json({
          status: 'error',
          message: 'You didn\'t like the tweet'
        })
      }

      tweet = {
        id: tweet.id,
        UserId: tweet.UserId,
        description: tweet.description,
        createdAt: tweet.createdAt,
        updatedAt: tweet.updatedAt,
        replyCounts: tweet.Replies.length,
        likeCounts: tweet.Likes.length,
        isLike: req.user.LikedTweets.map(like => like.id).includes(tweet.id),
        user: {
          name: tweet.User.name,
          avatar: tweet.User.avatar,
          account: tweet.User.account,
        }
      }
      return res.status(200).json(tweet)
    } catch (err) {
      next(err)
    }
  },
  deleteTweet: async (req, res, next) => {
    try {
      const { id } = req.params
      const tweet = await Tweet.findByPk(id)
      if (!tweet) {
        return res.status(422).json({
          status: 'error',
          message: 'Can not find this tweet!'
        })
      }

      if (tweet.UserId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'you can not delete this tweet!'
        })
      }
      await tweet.destroy()
      await Reply.destroy({ where: { TweetId: tweet.id } })
      await Like.destroy({ where: { TweetId: tweet.id } })
      res.status(200).json({
        status: 'success',
        message: 'delete successfully'
      })
    } catch (err) {
      next(err)
    }
  },
  postTweet: async (req, res, next) => {
    try {
      const { description } = req.body

      if (!description.trim()) {
        return res.status(404).json({
          status: 'error',
          message: 'Tweet can not be blank!'
        })
      }

      await Tweet.create({
        description: description,
        UserId: req.user.id
      })

      res.status(200).json({
        status: 'success',
        message: 'Successfully posted'
      })

    } catch (err) {
      next(err)
    }
  },
  putTweet: async (req, res, next) => {
    try {
      const { description } = req.body
      const { id } = req.params

      const tweet = await Tweet.findByPk(id)

      if (!tweet) {
        return res.status(404).json({
          status: 'error',
          message: 'Can not find this tweet!'
        })
      }

      if (tweet.UserId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'you can not edit this tweet!'
        })
      }

      await tweet.update({
        id: tweet.id,
        UserId: tweet.UserId,
        description: description,
      })

      return res.status(200).json({
        status: 'success',
        message: 'edit successfully'
      })
       
    } catch (err) {
      next(err)
    }
  },
  postReply: async (req, res, next) => {
    try {
      const { tweetId } = req.params
      const tweet = await Tweet.findByPk(tweetId)
      const { comment } = req.body

      if (!tweet) {
        return res.status(422).json({
          status: 'error',
          message: 'Can not find this tweet!'
        })
      }

      if (!comment.trim()) {
        return res.status(422).json({
          status: 'error',
          message: 'Can not be blank!'
        })
      }

      const reply = await Reply.create({
        UserId: req.user.id,
        TweetId: tweetId,
        comment: comment
      })

      return res.status(200).json({
        status: 'success',
        message: 'post reply successfully'
      })

    } catch (err) {
      next(err)
    }

  },
  getReply: async (req, res, next) => {
    try {
      const { tweetId } = req.params
      const tweet = await Tweet.findByPk(tweetId)

      if (!tweet) {
        return res.status(422).json({
          status: 'error',
          message: 'Can not find this tweet!'
        })
      }

      const replies = await Reply.findAll({
        raw: true,
        nest: true,
        where: { TweetId: tweetId }
      })

      return res.status(200).json(replies)
    } catch (err) {
      next(err)
    }
  },
  addLike: async (req, res, next) => {
    try {
      const { tweetId } = req.params

      const like = await Like.findOne({
        where: {
          UserId: req.user.id,
          TweetId: tweetId
        }
      })

      if (like) {
        return res.status(409).json({
          status: 'error',
          message: 'already liked'
        })
      }
      await Like.create({
        UserId: req.user.id,
        TweetId: tweetId
      })

      return res.status(200).json({
        status: 'success',
        message: 'Add like successfully'
      })
    } catch (err) {
      next(err)
    }
  },
  removeLike: async (req, res, next) => {
    try {
      const { tweetId } = req.params

      const like = await Like.findOne({
        where: {
          UserId: req.user.id,
          TweetId: tweetId
        }
      })

      if (!like) {
        return res.status(409).json({
          status: 'error',
          message: 'You didn\'t like the tweet'
        })
      }

      await like.destroy()

      return res.status(200).json({
        status: 'success',
        message: 'Remove like successfully'
      })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = tweetController