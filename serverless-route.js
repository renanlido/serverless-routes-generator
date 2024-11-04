
    module.exports = {
      functions: {
  "route-path": {
    "handler": "src/modules/test/handler.route-path",
    "events": [
      {
        "http": {
          "cors": true,
          "method": "POST",
          "path": "test/route-path"
        }
      }
    ]
  }
}
    };