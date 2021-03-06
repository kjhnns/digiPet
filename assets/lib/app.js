// Initialize app and store it to myApp variable for futher access to its methods
var myApp = new Framework7({
    pushState: true
});

// We need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Adding views
var digiPetView = myApp.addView('.view-digipet', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    // Enable Dom Cache so we can use all inline pages
    domCache: true
});
var settingsView = myApp.addView('.view-settings', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    // Enable Dom Cache so we can use all inline pages
    domCache: true
});
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    // Enable Dom Cache so we can use all inline pages
    domCache: true
});


var _moreButton = false;
var _openedSettings = false;
var _disclosed = false;
var _digiPetState = {
    happiness: 50,
    picker: '.picker-activies',
    activityTime: 1500,
    loaded: false,
    disclosed: false
};

window.onbeforeunload = function(e) {
    return 'Are you sure you want to leave?';
};

// IN APP

var redirection = function() {
    window.onbeforeunload = null;
    parent.document.getElementById("frame").style.display = "none";
    parent.document.getElementById("redirectMsg").style.display = "block";


    // baseurl
    var href = "http://umfragen.ise.tu-darmstadt.de/sosci/pmob/";

    // parameters
    href += "?i=" + __ref;
    href += "&password=test";
    href += "&c=" + (_disclosed === true ? '1' : '0');
    href += "&d=" + (_digiPetState.disclosed === true ? '1' : '0');
    href += "&m=" + (_moreButton === true ? '1' : '0');
    href += "&s=" + (_openedSettings === true ? '1' : '0');


    parent.window.location = href;
};

var disclosureRequest = function(cbOk, ckCa) {
    myApp.confirm('Are you willing to allow DigiPet to access your GPS Location?', 'Disclosure Request',
        function() {
            if (cbOk) {
                cbOk();
            }
        },
        function() {
            if (ckCa) {
                ckCa();
            }
        });
};



// SETTINGS
$$('.digipet-settings .settings-disclose').on('click', function() {
    disclosureRequest(function() {
        _digiPetState.disclosed = true;
        _disclosed = true;
    }, function() {
        _digiPetState.disclosed = false;
    });
});

$$('.view.view-settings').on('show', function() {
    _openedSettings = true;
});


$$('.homelink').on('click', function() {
    myApp.showTab('.view-main');
});

function moreInfo() {
    _moreButton = true;
    window.open('http://digipet.herokuapp.com/pps', '_blank');
}

(function() {
    if (__pps) {
        var eventListener = false;
        var _disclosureRequest = disclosureRequest;
        disclosureRequest = function(cbo, cbc) {
            myApp.closePanel();
            myApp.closeModal(_digiPetState.picker);
            myApp.popup('.popup-pps');
            $('.popup-overlay.modal-overlay-visible').hide();
            if (eventListener === false) {
                $$('.popup .btn-okay').on('click', function() {
                    $('.popup-overlay.modal-overlay-visible').show();
                    myApp.pickerModal(_digiPetState.picker);
                    myApp.closeModal('.popup-pps');
                    _disclosureRequest(cbo, cbc);
                });
                eventListener = true;
            }
        };
    }
})();

var digiPetController = function(app) {

    // update happiness
    function happiness(plus) {
        _digiPetState.happiness += plus;
        _digiPetState.swiper._slideTo(0);
        if (_digiPetState.happiness >= 100) {
            _digiPetState.happiness = 100;
        }
        if (_digiPetState.happiness >= 70 && _digiPetState.happiness < 90) {
            $('.progressbar .progress').css('background', '#5cb85c');
        }

        if (_digiPetState.happiness >= 90) {
            $('.progressbar .progress').css('background', '#4cae4c');
        }

        $('.progressbar .progress').css('width', _digiPetState.happiness + '%');
        if (_digiPetState.happiness >= 100) {
            setTimeout(redirection, 1200);
        }

        $('.pet .plus').html('+' + plus + '%');
        $('#happiness').html(_digiPetState.happiness);
        setTimeout(function() {
            $('.pet .plus').html('');
        }, _digiPetState.activityTime);
    }


    var eat = function() {
        myApp.closeModal(_digiPetState.picker);
        $('#pet').attr("src", '/assets/imgs/eat.png');
        happiness(10);
        setTimeout(function() {
            $('#pet').attr("src", '/assets/imgs/idle.png');
            myApp.pickerModal(_digiPetState.picker);
        }, _digiPetState.activityTime);
    };

    var playUI = {
        nogps: function() {
            $('.digipet-play .gps').hide();
            $('.digipet-play .nogps').show();
            $('.play-users').hide();
            $('.play-load').hide();
            myApp.closeModal(_digiPetState.picker);
        },

        gps: function() {
            $('.digipet-play .gps').show();
            $('.digipet-play .nogps').hide();
            $('.play-users').hide();
            $('.play-load').show();
            myApp.closeModal(_digiPetState.picker);
            playUI.useGPS();
        },

        useGPS: function() {
            setTimeout(function() {
                $('.play-load').hide();
                $('.play-users').show();
            }, 3000);
        }
    };

    var playSearch = function() {
        myApp.closeModal(_digiPetState.picker);
        digiPetView.router.loadPage('#play');


        if (__dr) {
            if (_digiPetState.disclosed === false) {
                disclosureRequest(function() {
                    _digiPetState.disclosed = true;
                    _disclosed = true;
                    playUI.gps();
                }, function() {
                    _digiPetState.disclosed = false;
                    playUI.nogps();
                });
            } else {
                playUI.gps();
            }
        } else {
            if (_digiPetState.disclosed === true) {
                playUI.gps();
            } else {
                playUI.nogps();
            }
        }

    };

    var play = function(page) {
        digiPetView.router.loadPage('#index');
        $('#pet').attr("src", '/assets/imgs/dog2.png');
        happiness(25);
        setTimeout(function() {
            $('#pet').attr("src", '/assets/imgs/idle.png');
            myApp.pickerModal(_digiPetState.picker);
        }, _digiPetState.activityTime);
    };

    var loadPicker = function() {
        myApp.pickerModal(_digiPetState.picker);
    };



    var registerBindings = function() {


        $$('[data-page="play"] .left').on('click', loadPicker);

        // Play
        $$('.picker-activies .activity-play').on('click', playSearch);

        // eat
        $$('.play-users .activity-play').on('click', play);

        $$('.link.gpsService').on('click', function() {
            if (__dr) {
                disclosureRequest(function() {
                    _digiPetState.disclosed = true;
                    _disclosed = true;
                    playUI.gps();
                }, function() {
                    _digiPetState.disclosed = false;
                    playUI.nogps();
                });
            } else {
                playUI.nogps();
                myApp.pickerModal(_digiPetState.picker);
                digiPetView.router.loadPage('#index');
                myApp.showTab('.view-settings');
            }
        });

        // eat
        $$('.picker-activies .activity-eat').on('click', eat);



        // STATUS
        $$('.picker-activies .btn-status').on('click', function() {
            _digiPetState.swiper._slideTo(0);
        });

        // ACTIVITIES
        $$('.picker-activies .btn-activities').on('click', function() {
            _digiPetState.swiper._slideTo(1);
        });
    };



    // Initialize
    (function() {
        if (_digiPetState.loaded === false) {
            if (!__dr) {
                disclosureRequest(function() {
                    _digiPetState.disclosed = true;
                    _disclosed = true;
                }, function() {
                    _digiPetState.disclosed = false;
                });
            }
            // show the activities picker
            app.pickerModal(_digiPetState.picker);

            // init swiper
            _digiPetState.swiper = app.swiper('.menu-swiper', {
                spaceBetween: 0
            });
            // init progressbar
            $('.progressbar .progress').css('width', _digiPetState.happiness + '%');
            $('#happiness').html(_digiPetState.happiness);

            registerBindings();

            _digiPetState.loaded = true;
        }
    })();

};
