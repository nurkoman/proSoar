var InfoscreenIGC = new Class({

  Implements: Events,

  initialize: function(proSoar) {
    this.proSoar = proSoar;
    this.igcfile = null;

    this.proSoar.map.addIGCLayer();
    this.showUploadButton();
  },

  dlgOpen: function() {
    if (this.proSoar.dialogOverlay) return;

    this.dialog = new MUX.Dialog({
      modal: true,
      title: _('Add IGC File...'),
      content: this.dlgPrepareContent(),
      autoOpen: false,
      onClose: function() { this.dlgClose(); }.bind(this)
    });

    this.dialog.open();

    var upload = new Form.Upload('igcfile-upload-file', {
      onComplete: function(response) {
        this.addIGCFileComplete(JSON.decode(response, true));
      }.bind(this)
    });

    this.dialog.moveToTop();
    this.proSoar.dialogOverlay = true;
  },

  dlgClose: function() {
    this.proSoar.dialogOverlay = false;
  },

  dlgPrepareContent: function() {

    var content = new Element('div', {
      id: 'upload-igcfile-dialog'
    });

    var form = new Element('form', {
      id: 'upload-igcfile-dialog-form',
      method: 'post',
      action: 'igc/upload',
      enctype: 'multipart/form-data'
    });

    var formRow = new Element('div', {
      'class': 'formRow'
    });

    formRow.grab(new Element('input', {
      type: 'file',
      id: 'igcfile-upload-file',
      name: 'igcfile-upload-file'
    }) );

    form.grab(formRow);

    formRow = new Element('div', {
      'class': 'formRow'
    });

    formRow.grab(new Element('input', {
      type: 'submit',
      id: 'igcfile-upload-submit',
      name: 'igcfile-upload-submit',
      value: _('Add')
    }) );

    form.grab(formRow);

    var fieldset = new Element('fieldset', {
      legend: 'Upload'
    });

    fieldset.grab(form);
    content.grab(fieldset);

    return content;
  },

  addIGCFileComplete: function(response) {
    if (response.success) {
      this.igcfile = response.flight;
      this.igcFileAdded();
    }

    this.dialog.close();
  },

  showUploadButton: function() {
    var button = new Element('div', {
      'id': 'igcfile-upload'
    });

    button.grab(new Element("button", {
      'id': 'igcfile-upload-button',
      'html': _("Analyse IGC file"),
      'class': 'button',
      events: {
        click: function(e) { return this.dlgOpen(); }.bind(this)
      }
    }) );

    $("igcfile-container").grab(button);
  },

  igcFileAdded: function() {
    this.proSoar.map.addIGCFeature(this.igcfile.trace);
    $("igcfile-upload-button").dispose();

    $("igcfile-container").grab(this.prepareIGCFileInfo());
  },

  prepareIGCFileInfo: function() {
    var info = new Element('div', {
      id: 'igcfile-info'
    });

    var filename = new Element('div', {
      id: 'igcfile-name',
      html: _("File") + ': ' + this.igcfile.filename
    });

    filename.grab(new Element('img', {
      src: 'images/delete.png',
      events: {
        click: function(e) { return this.deleteIGCFile(); }.bind(this)
      }
    }) );

    info.grab(filename);

    var takeoff_time = new Date().parse(this.igcfile.info.takeoff);
    var landing_time = new Date().parse(this.igcfile.info.landing);

    var takeoff_landing = new Element('div', {
      id: 'igcfile-takeoff-landing',
      html: _("Takeoff") + ': ' + takeoff_time.format(_("%x %X")) + '<br>' +
            _("Landing") + ': ' + landing_time.format(_("%x %X"))
    });

    info.grab(takeoff_landing);

    var contest = new Element('div', {
      id: 'igcfile-contest'
    });

    contest.grab(this.showOLCPlus());
    info.grab(contest);

    return info;
  },

  showOLCPlus: function() {
    var olcplus = new Element('table', {
      id: 'igcfile-contest-olcplus'
    });

    olcplus.grab(new Element('thead', {
      html: '<tr><th colspan="3">' + _("OLC") + '</th></tr>'
    }) );

    var tbody = new Element('tbody');

    tbody.grab(new Element('tr', {
      html: '<td>' + _("Plus") + ':</td>' +
            '<td>' + Math.round(this.igcfile.info.olc_plus.plus.distance/10)/100 + ' ' + _("km") + '</td>' +
            '<td>' + Math.round(this.igcfile.info.olc_plus.plus.speed*3.6*10)/10 + ' ' + _("km/h") + '</td>'
    }) );

    tbody.grab(new Element('tr', {
      html: '<td>' + _("Triangle") + ':</td>' +
            '<td>' + Math.round(this.igcfile.info.olc_plus.triangle.distance/10)/100 + ' ' + _("km") + '</td>' +
            '<td>' + Math.round(this.igcfile.info.olc_plus.triangle.speed*3.6*10)/10 + ' ' + _("km/h") + '</td>'
    }) );

    olcplus.grab(tbody);

    return olcplus;
  },

  deleteIGCFile: function() {
    this.proSoar.map.removeIGCFeature();
    delete this.igcfile;
    $('igcfile-info').dispose();
    this.showUploadButton();
  }

});

