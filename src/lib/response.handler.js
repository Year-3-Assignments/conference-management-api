export default {
  sendRespond: function(res, data, status = 200) {
    if (data == null) {
      return res.status(404).send({ status: 404, message: 'Data Not Found!' });
    } else {
      return res.status(status).send({ data: data });
    }
  },

  sendNotFound: function(res) {
    return function(data) {
      if (data == null) {
        return res.status(404).send({ status: 404, message: 'Data Not Found!' });
      } else {
        return res.status(200).send({ data: data });
      }
    }
  },

  handleError: function(res, error) {
    if (error) {
      return res.status(400).send({ status: 400, messages: error });
    }
  }
}