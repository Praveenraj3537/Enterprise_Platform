
var livebluetoothSocket = function () {
    navigator.bluetooth.requestDevice({
        filters: [{
          services: [0x1234, 0x12345678, '99999999-0000-1000-8000-00805f9b34fb']
        }]
      })
      .then(device => { / … / })
      .catch(error => { console.error(error); });
}