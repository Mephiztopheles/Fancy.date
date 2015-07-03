(function ( window, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.0.0"
    } );
    var NAME    = "FancyDate",
        VERSION = "1.0.1",
        logged  = false;

    function findByKey ( obj, index ) {
        var r,
            i = 0;
        for ( var k in obj ) {
            if ( i == index ) r = k;
            i++;
        }
        return r;
    }

    function FancyDate ( element, settings ) {
        var SELF = this;
        if ( element[ 0 ].nodeName != 'INPUT' ) {
            console.error ( NAME + ' needs an input to be bound to!' );
            return;
        }

        SELF.settings  = $.extend ( {}, Fancy.settings[ NAME ], settings );
        SELF.visible   = false;
        SELF.calculate = {
            day   : 24 * 60 * 60 * 1000,
            hour  : 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        };

        SELF.element = element;
        SELF.version = VERSION;
        SELF.name    = NAME;

        SELF.today    = SELF.decode ( SELF.encode ( new Date () ) );
        SELF.current  = SELF.element.val () ? SELF.decode ( SELF.element.val () ) : SELF.decode ( SELF.encode ( new Date () ) );
        SELF.selected = SELF.decode ( SELF.element.val () );
        Fancy.watch ( Fancy, "selected", function ( prop, old, val ) {
            setTimeout ( function () {
                SELF.element.val ( SELF.encode ( SELF.selected ) );
            }, 0 );
            return new Date ( val );
        } );

        SELF.init ();
        return SELF;
    }

    FancyDate.api = FancyDate.prototype = {};
    FancyDate.api.version   = VERSION;
    FancyDate.api.name      = NAME;
    FancyDate.api.init      = function () {
        var SELF = this;
        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
        }
        SELF.element.addClass ( SELF.name + '-element' );

        this.html = {
            wrapper      : $ ( '<div/>', {
                id: SELF.name + '-wrapper'
            } ),
            dialog       : $ ( '<div/>', {
                id: SELF.name + '-dialog'
            } ).attr ( 'onselectstart', function () {
                return false;
            } ),
            inner        : $ ( '<div/>', {
                id: SELF.name + '-inner'
            } ),
            previous     : $ ( '<div/>', {
                id     : SELF.name + '-previous',
                "class": SELF.name + '-button'
            } ),
            previousArrow: $ ( "<div/>", {
                "class": SELF.name + '-arrow'
            } ),
            next         : $ ( '<div/>', {
                id     : SELF.name + '-next',
                "class": SELF.name + '-button'
            } ),
            nextArrow    : $ ( "<div/>", {
                "class": SELF.name + '-arrow'
            } ),
            title        : $ ( '<div/>', {
                id: SELF.name + '-title'
            } ),
            year         : $ ( '<span/>', {
                id: SELF.name + '-year'
            } ),
            yearChanger  : $ ( "<div/>", {
                id: SELF.name + '-year-changer'
            } ),
            month        : $ ( '<span/>', {
                id: SELF.name + '-month'
            } ),
            header       : $ ( '<div/>', {
                id: SELF.name + '-header'
            } ),
            body         : $ ( '<div/>', {
                id: SELF.name + '-body'
            } ),
            footer       : $ ( '<div/>', {
                id: SELF.name + '-footer'
            } ),
            close        : $ ( '<div/>', {
                id     : SELF.name + '-close',
                "class": SELF.name + '-button',
                html   : SELF.translate ( 'button', 'close' )
            } ),
            today        : $ ( '<div/>', {
                id     : SELF.name + '-today',
                "class": SELF.name + '-button',
                html   : SELF.translate ( 'button', 'today' )
            } ),
            clear        : $ ( '<div/>', {
                id     : SELF.name + '-clear',
                "class": SELF.name + '-button',
                html   : SELF.translate ( 'button', 'clear' )
            } ),
            calendar     : $ ( '<div/>', {
                id: SELF.name + '-calendar'
            } ),
            days         : [],
            rows         : []
        };

        SELF.element.off ( "." + NAME ).on ( "keydown." + NAME, function ( e ) {
            setTimeout ( function () {
                if ( (e.which | e.keyCode) === 9 ) SELF.close ();
            }, 2 );
        } ).on ( "focus." + NAME, function () {
            if ( !SELF.visible && SELF.settings.query ( SELF.element ) )
                SELF.open ();
        } ).on ( "blur." + NAME, function () {
            SELF.close ();
        } ).on ( "input." + NAME + " paste." + NAME, function ( e ) {
            e.preventDefault ();
            e.stopPropagation ();
        } );



    };
    FancyDate.api.open      = function () {
        var SELF = this;
        if ( !SELF.element[ 0 ].readOnly && !SELF.element[ 0 ].disabled ) {
            if ( this.settings.free ) {
                $ ( "body" ).append ( SELF.html.wrapper ).addClass ( SELF.name );
                SELF.html.wrapper.append ( SELF.html.dialog );
            } else {
                $ ( "body" ).append ( SELF.html.dialog ).addClass ( SELF.name );
            }
            SELF.html.dialog.append ( SELF.html.inner );
            SELF.html.inner.append ( SELF.html.header ).append ( SELF.html.body ).append ( SELF.html.footer );
            SELF.html.header.append ( SELF.html.previous.append ( SELF.html.previousArrow ) ).append ( SELF.html.title ).append ( SELF.html.next.append ( SELF.html.nextArrow ) );
            SELF.html.body.html ( SELF.html.calendar );
            SELF.html.footer.html ( SELF.html.close ).append ( SELF.html.today ).append ( SELF.html.clear );

            SELF.html.dialog.hide ();

            function show () {
                SELF.html.dialog.show ();
                SELF.visible = true;
                SELF.create ();
                SELF.settings.onOpen.call ( SELF );
            }

            if ( SELF.settings.animated ) {
                setTimeout ( function () {
                    show ();
                    SELF.html.dialog.addClass ( 'show' ).removeClass ( 'hide' );
                }, 0 );
            } else {
                show ();
            }
        }

        return SELF;
    };
    FancyDate.api.close     = function () {
        var SELF = this;
        if ( !SELF.html.dialog.hasClass ( 'hide' ) ) {
            SELF.element.unbind ( '.' + SELF.name + ':prevent' );

            function hide () {
                SELF.html.wrapper.remove ();
                SELF.html.dialog.remove ();
                SELF.html.calendar.children ().remove ();
                SELF.html.header.children ().remove ();
                SELF.html.title.children ().remove ();
                SELF.element.unbind ( "." + NAME + ":prevent" );
                SELF.element[ 0 ].blur ();
                SELF.visible = false;
                SELF.settings.onClose.call ( SELF );
                $ ( 'body' ).removeClass ( SELF.name );
            }

            if ( SELF.settings.animated ) {
                setTimeout ( hide, 300 );
                SELF.html.dialog.addClass ( 'hide' ).removeClass ( 'show' );
            } else {
                hide ();
            }
        }

        return SELF;
    };
    FancyDate.api.update    = function () {
        var SELF = this;
        SELF.html.calendar.html ( '' );
        SELF.html.title.html ( SELF.html.month.html ( SELF.translate ( 'month', SELF.current.getMonth () ) ) ).append ( SELF.html.year.html ( SELF.current.getFullYear () ) );
        SELF.create ();
    };
    FancyDate.api.create    = function () {
        var SELF    = this,
            current = new Date ( this.current.getFullYear (), this.current.getMonth (), 1 ),
            i       = 0,
            n       = 0;
        this.html.title.append ( this.html.month.html ( this.translate ( "month", this.current.getMonth () ) ) ).append ( this.html.year.html ( this.current.getFullYear () ) );
        this.html.title.append ( this.html.yearChanger );
        this.html.yearChanger.children ().remove ();
        if ( current.getDay () != 1 && current.getDay () != 0 ) {
            var c   = new Date ( this.current.getFullYear (), this.current.getMonth (), 0 );
            current = new Date ( this.current.getFullYear (), this.current.getMonth () - 1, (c.getDate () - current.getDay () + 2) );
        } else if ( current.getDay () == 0 ) {
            var c   = new Date ( this.current.getFullYear (), this.current.getMonth (), 0 );
            current = new Date ( this.current.getFullYear (), this.current.getMonth () - 1, (c.getDate () - 5) );
        } else {
            var c   = new Date ( this.current.getFullYear (), this.current.getMonth (), 0 );
            current = new Date ( this.current.getFullYear (), this.current.getMonth () - 1, (c.getDate () - 6) );
        }

        var ul = $ ( "<ul/>" );

        function change ( li, y ) {
            li.on ( "click", function () {
                SELF.setYear ( y );
            } );
        }

        this.html.yearChanger.append ( ul );
        for ( var y = this.current.getFullYear () + 50; y > this.current.getFullYear () - 50; y-- ) {
            var li = $ ( "<li/>", {
                html: this.translate ( "month", this.current.getMonth () ) + " " + y
            } );
            ul.append ( li );
            change ( li, y );
        }

        this.html.days = [];
        this.html.rows = [];

        this.html.calendar.children ().remove ();
        if ( this.settings.showWeekHeader ) {
            var rowh = $ ( "<div/>", {
                id: this.name + "-rowh"
            } );
            this.html.calendar.append ( rowh );

            function createHeader ( day ) {
                var u = $ ( "<div/>", {
                    id     : SELF.name + "-rowh-" + day,
                    "class": SELF.name + "-rowh",
                    html   : SELF.translate ( "day", day )
                } );
                rowh.append ( u );
            }

            createHeader ( "mo" );
            createHeader ( "tu" );
            createHeader ( "we" );
            createHeader ( "th" );
            createHeader ( "fr" );
            createHeader ( "sa" );
            createHeader ( "su" );

        }
        while ( i < 6 ) {
            i++;
            this.html.rows[ i ] = $ ( '<div/>', {
                id     : this.name + '.row-' + i,
                "class": this.name + '-row'
            } );
            this.html.calendar.append ( this.html.rows[ i ] );
            var day             = 0;
            while ( day < 7 ) {
                day++;
                n++;
                var d = $ ( '<div/>', {
                    id     : this.name + '-day-' + n,
                    "class": this.name + '-day' + ' ' + this.name + '-button',
                    html   : current.getDate ()
                } ).data ( 'date', current );

                if ( current.getMonth () != this.current.getMonth () ) d.addClass ( this.name + '-day-extern' );
                if ( current.getMonth () == this.today.getMonth () && current.getDate () == this.today.getDate () && current.getFullYear () == SELF.today.getFullYear () ) d.addClass ( this.name + '-day-today' );
                if ( this.selected && current.getTime () === this.selected.getTime () ) d.addClass ( this.name + '-active' );

                current = new Date ( current.getTime () + this.calculate.day );
                this.html.days.push ( d );
                this.html.rows[ i ].append ( d );

            }
        }

        var width = this.html.body.outerWidth () / 7;
        $ ( this.html.days ).each ( function () {
            $ ( this ).css ( {
                width: parseInt ( width + 1 - parseInt ( $ ( this ).css ( "paddingLeft" ) ) - parseInt ( $ ( this ).css ( "paddingRight" ) ) )
            } );
        } );
        $ ( "." + this.name + "-rowh" ).each ( function () {
            $ ( this ).css ( {
                width: parseInt ( width + 1 - parseInt ( $ ( this ).css ( "paddingLeft" ) ) - parseInt ( $ ( this ).css ( "paddingRight" ) ) )
            } );
        } );

        if ( this.settings.free ) {
            this.html.dialog.css ( {
                marginTop : (window.innerHeight - this.html.dialog.outerHeight ()) / 2,
                marginLeft: (window.innerWidth - this.html.dialog.outerWidth ()) / 2
            } );
        } else {
            this.html.dialog.css ( {
                position: "absolute",
                left    : this.element.offset ().left,
                top     : this.element.offset ().top + this.element.outerHeight ()
            } );
        }

        this.addEventListener();
        return this;
    };
    FancyDate.api.addEventListener = function () {
        var SELF = this;

        for ( var i = 0; i < this.html.days.length; i++ ) {
            $ ( this.html.days[ i ] ).on ( 'click', function (e) {
                SELF.select ( new Date ( $ ( this ).data ( 'date' ) ) );
                e.preventDefault ();
                e.stopPropagation ();
                e.stopImmediatePropagation ();
            } );
        }

        this.html.dialog.off ( "mousedown" ).on ( "mousedown", function ( e ) {
            e.preventDefault ();
            e.stopPropagation ();
            e.stopImmediatePropagation ();
        } );

        this.html.clear.off ( "click" ).on ( "click", function () {
            SELF.element.val ( "" );
            SELF.selected = null;
            SELF.current  = SELF.today;
            if ( typeof SELF.settings.onSelect == "function" ) SELF.settings.onSelect ( SELF.selected );
            SELF.close ();
        } );

        this.html.dialog.off ( "." + this.name ).on ( 'selectstart.' + this.name, function ( event ) {
            "use strict";
            event.preventDefault ();
        } );

        this.html.close.off ( "click" ).on ( 'click', function () {
            SELF.close ();
        } );

        this.html.today.off ( 'click' ).on ( 'click', function () {
            SELF.select ( SELF.today );
            SELF.current = SELF.today;
            SELF.close ();
        } );

        this.html.next.off ( 'click' ).on ( 'click', function () {
            SELF.current = new Date ( SELF.current.getFullYear (), SELF.current.getMonth () + 1, 1 );
            SELF.update ();
        } );

        this.html.previous.off ( 'click' ).on ( 'click', function () {
            SELF.current = new Date ( SELF.current.getFullYear (), SELF.current.getMonth () - 1, 1 );
            SELF.update ();
        } );

        return this;
    };
    FancyDate.api.select    = function ( date ) {
        var SELF      = this;
        SELF.element.val ( SELF.encode ( date ) );
        SELF.selected = date;
        if ( typeof SELF.settings.onSelect == "function" ) SELF.settings.onSelect ( SELF.selected );
        SELF.close ();
        return this;
    };
    FancyDate.api.encode    = function ( date, format ) {
        var SELF = this;
        format   = format || SELF.settings.format;
        return format.replace ( 'dd', (date.getDate () < 10 ? '0' + date.getDate () : date.getDate ()) ).replace ( 'mm', (date.getMonth () < 9 ? '0' + (date.getMonth () + 1) : (date.getMonth () + 1)) ).replace ( 'yyyy', date.getFullYear () );
    };
    FancyDate.api.decode    = function ( date ) {
        var SELF   = this;
        var format = {
            d: parseInt ( date.substring ( SELF.settings.format.indexOf ( 'dd' ), SELF.settings.format.indexOf ( 'dd' ) + 2 ) ),
            m: parseInt ( date.substring ( SELF.settings.format.indexOf ( 'mm' ), SELF.settings.format.indexOf ( 'mm' ) + 2 ) ) - 1,
            y: parseInt ( date.substring ( SELF.settings.format.indexOf ( 'yyyy' ), SELF.settings.format.indexOf ( 'yyyy' ) + 4 ) )
        };
        return new Date ( format.y, format.m, format.d );
    };
    FancyDate.api.translate = function ( key, value ) {
        var l = FancyDate.translation[ navigator.language ] ? navigator.language : 'en',
            t = FancyDate.translation[ l ][ key ];
        if ( typeof t[ 0 ] == "undefined" && typeof value == "number" ) {
            value = findByKey ( t, value );
        }
        if ( t ) t = FancyDate.translation[ l ][ key ][ value ];
        return t;
    };
    FancyDate.api.setYear   = function ( year ) {
        this.current.setYear ( year );
        this.create ();
    };
    Fancy.settings[ NAME ]  = {
        format        : "dd.mm.yyyy",
        animated      : true,
        onSelect      : function () {},
        onOpen        : function () {},
        onClose       : function () {},
        query         : function () {
            return true;
        },
        free          : true,
        showWeekHeader: true
    };

    FancyDate.translation = {
        de: {
            month : [ 'Januar', 'Februar', 'M&auml;rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ],
            day   : {
                mon: "Montag",
                mo : "Mo",
                tue: "Dienstag",
                tu : "Di",
                wen: "Mittwoch",
                we : "Mi",
                thu: "Donnerstag",
                th : "Do",
                fri: "Freitag",
                fr : "Fr",
                sat: "Samstag",
                sa : "Sa",
                sun: "Sonntag",
                su : "So"
            },
            button: {
                close: 'Schlie&szlig;en',
                today: 'Heute',
                clear: 'L&ouml;schen'
            }
        },
        en: {
            month : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
            day   : {
                mon: 'Mon',
                tue: 'Tue',
                wen: 'Wed',
                thu: 'Thu',
                fri: 'Fri',
                sat: 'Sat',
                sun: 'Sun'
            },
            button: {
                close: 'Close',
                today: 'Today',
                clear: 'Clear'
            }
        }
    };
    Fancy.date            = VERSION;
    Fancy.api.date        = function ( settings ) {
        return this.set ( NAME, function ( el ) {
            return new FancyDate ( el, settings )
        } );
    };

}) ( window, jQuery );