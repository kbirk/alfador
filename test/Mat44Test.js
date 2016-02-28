(function() {

    'use strict';

    var assert = require('assert');
    var Mat33 = require('../src/Mat33');
    var Mat44 = require('../src/Mat44');
    var Vec3 = require('../src/Vec3');
    var Vec4 = require('../src/Vec4');
    var Transform = require('../src/Transform');
    var EPSILON = require('../src/Epsilon');

    describe('Mat44', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var i,
                    a0 = Math.random(), b0 = Math.random(), c0 = Math.random(), d0 = Math.random(),
                    a1 = Math.random(), b1 = Math.random(), c1 = Math.random(), d1 = Math.random(),
                    a2 = Math.random(), b2 = Math.random(), c2 = Math.random(), d2 = Math.random(),
                    a3 = Math.random(), b3 = Math.random(), c3 = Math.random(), d3 = Math.random(),
                    p = new Mat44([ a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3 ]),
                    q;
                for ( i=0; i<p.data.length; i++ ) {
                    q = new Mat44([ a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3 ]);
                    q.data[i] = q.data[i] + 1;
                    assert.equal( p.equals( q ), false );
                }
            });
            it('should return true if all components match', function() {
                var a0 = Math.random(), b0 = Math.random(), c0 = Math.random(), d0 = Math.random(),
                    a1 = Math.random(), b1 = Math.random(), c1 = Math.random(), d1 = Math.random(),
                    a2 = Math.random(), b2 = Math.random(), c2 = Math.random(), d2 = Math.random(),
                    a3 = Math.random(), b3 = Math.random(), c3 = Math.random(), d3 = Math.random(),
                    p = new Mat44([ a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3 ]),
                    q = new Mat44([ a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3 ]);
                assert.equal( p.equals( q ), true );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random(),
                    m = new Mat44([
                        r, r, r, r,
                        r, r, r, r,
                        r, r, r, r,
                        r, r, r, r ]);
                assert.equal( m.equals( new Mat44([
                    r/2, r/2, r/2, r/2,
                    r/2, r/2, r/2, r/2,
                    r/2, r/2, r/2, r/2,
                    r/2, r/2, r/2, r/2 ]), r/2 ), true );
            });
        });

        describe('#random()', function() {
            it('should return a Mat44 with all random components', function() {
                var p = Mat44.random(),
                    q = new Mat44([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
                assert.equal( p.equals( q ), false );
            });
        });

        describe('#constructor()', function() {
            it('should return a deep copy when supplied another Mat44', function() {
                var p = Mat44.random(),
                    q = new Mat44( p );
                assert.equal( p.equals( q ), true );
            });
            it('should return a filled deep copy when supplied another Mat33', function() {
                var p = Mat33.random(),
                    q = new Mat44( p ),
                    r = new Mat44([
                        p.data[0], p.data[1], p.data[2], 0,
                        p.data[3], p.data[4], p.data[5], 0,
                        p.data[6], p.data[7], p.data[8], 0,
                        0, 0, 0, 1 ]);
                assert.equal( q.equals( r ), true );
            });
            it('should return a Mat44 from an array of length 9', function() {
                var p = new Mat44( [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16 ] ),
                    q = new Mat44( p );
                assert.equal( p.equals( q ), true );
            });
            it('should return an identity matrix when given invalid input', function() {
                var p = new Mat44( NaN, 4 ),
                    q = new Mat44( {'random':Math.random()} ),
                    r = new Mat44( {} ),
                    s = new Mat44( function() {
                        return false;
                    }),
                    t = new Mat44( [2,3,4] ),
                    identity = Mat44.identity();
                assert.equal( p.equals( identity ), true );
                assert.equal( q.equals( identity ), true );
                assert.equal( r.equals( identity ), true );
                assert.equal( s.equals( identity ), true );
                assert.equal( t.equals( identity ), true );
            });
        });

        describe('#row()', function() {
            it('should set the corresponding zero based row to the provided vector', function() {
                var p = Mat44.random();
                var t0 = Vec4.random();
                var t1 = Vec4.random();
                var t2 = Vec4.random();
                var t3 = Vec4.random();
                assert.equal( p.row(0, t0).row(0).equals( t0 ), true );
                assert.equal( p.row(1, t1).row(1).equals( t1 ), true );
                assert.equal( p.row(2, t2).row(2).equals( t2 ), true );
                assert.equal( p.row(3, t3).row(3).equals( t3 ), true );
            });
            it('should return a the corresponding row, by zero based index', function() {
                var p = Mat44.random();
                assert.equal( p.row(0).equals( new Vec4( p.data[0], p.data[4], p.data[8], p.data[12] ) ), true );
                assert.equal( p.row(1).equals( new Vec4( p.data[1], p.data[5], p.data[9], p.data[13] ) ), true );
                assert.equal( p.row(2).equals( new Vec4( p.data[2], p.data[6], p.data[10], p.data[14] ) ), true );
                assert.equal( p.row(3).equals( new Vec4( p.data[3], p.data[7], p.data[11], p.data[15] ) ), true );
            });
        });

        describe('#col()', function() {
            it('should set the corresponding zero based row to the provided vector', function() {
                var p = Mat44.random();
                var t0 = Vec4.random();
                var t1 = Vec4.random();
                var t2 = Vec4.random();
                var t3 = Vec4.random();
                assert.equal( p.col(0, t0).col(0).equals( t0 ), true );
                assert.equal( p.col(1, t1).col(1).equals( t1 ), true );
                assert.equal( p.col(2, t2).col(2).equals( t2 ), true );
                assert.equal( p.col(3, t3).col(3).equals( t3 ), true );
            });
            it('should return a the corresponding column, by zero based index', function() {
                var p = Mat44.random();
                assert.equal( p.col(0).equals( new Vec4( p.data[0], p.data[1], p.data[2], p.data[3] ) ), true );
                assert.equal( p.col(1).equals( new Vec4( p.data[4], p.data[5], p.data[6], p.data[7] ) ), true );
                assert.equal( p.col(2).equals( new Vec4( p.data[8], p.data[9], p.data[10], p.data[11] ) ), true );
                assert.equal( p.col(3).equals( new Vec4( p.data[12], p.data[13], p.data[14], p.data[15]) ), true );
            });
        });

        describe('#add()', function() {
            it('should return a Mat44 when passed a Mat44 argument', function() {
                var p = Mat44.random(),
                    q = Mat44.random(),
                    r = p.add( q );
                assert.equal( r instanceof Mat44, true );
                assert.equal( r.col(0).equals( p.col(0).add( q.col(0) ) ), true );
                assert.equal( r.col(1).equals( p.col(1).add( q.col(1) ) ), true );
                assert.equal( r.col(2).equals( p.col(2).add( q.col(2) ) ), true );
                assert.equal( r.col(3).equals( p.col(3).add( q.col(3) ) ), true );
            });
            it('should return a Mat44 when passed a Mat33 argument', function() {
                var p = Mat44.random(),
                    q = Mat33.random(),
                    r = p.add( q );
                assert.equal( r instanceof Mat44, true );
                assert.equal( r.col(0).equals( p.col(0).add( new Vec4( q.col(0) ) ) ), true );
                assert.equal( r.col(1).equals( p.col(1).add( new Vec4( q.col(1) ) ) ), true );
                assert.equal( r.col(2).equals( p.col(2).add( new Vec4( q.col(2) ) ) ), true );
                assert.equal( r.col(3).equals( p.col(3).add( [0,0,0,1] ) ), true );
            });
        });

        describe('#sub()', function() {
            it('should return a Mat44 when passed a Mat44 argument', function() {
                var p = Mat44.random(),
                    q = Mat44.random(),
                    r = p.sub( q );
                assert.equal( r instanceof Mat44, true );
                assert.equal( r.col(0).equals( p.col(0).sub( q.col(0) ) ), true );
                assert.equal( r.col(1).equals( p.col(1).sub( q.col(1) ) ), true );
                assert.equal( r.col(2).equals( p.col(2).sub( q.col(2) ) ), true );
                assert.equal( r.col(3).equals( p.col(3).sub( q.col(3) ) ), true );
            });
            it('should return a Mat44 when passed a Mat33 argument', function() {
                var p = Mat44.random(),
                    q = Mat33.random(),
                    r = p.sub( q );
                assert.equal( r instanceof Mat44, true );
                assert.equal( r.col(0).equals( p.col(0).sub( new Vec4( q.col(0) ) ) ), true );
                assert.equal( r.col(1).equals( p.col(1).sub( new Vec4( q.col(1) ) ) ), true );
                assert.equal( r.col(2).equals( p.col(2).sub( new Vec4( q.col(2) ) ) ), true );
                assert.equal( r.col(3).equals( p.col(3).sub( [0,0,0,1] ) ), true );
            });
        });

        describe('#mult()', function() {
            it('should return a Mat44 when passed a Mat44 argument', function() {
                var p = Mat44.random(),
                    q = Mat44.random(),
                    r = p.mult( q );
                assert.equal( r instanceof Mat44, true );
            });
            it('should return a Mat44 when passed a Mat33 argument', function() {
                var p = Mat44.random(),
                    q = Mat33.random(),
                    r = p.mult( q ),
                    s = p.mult( new Mat44( q ) );
                assert.equal( r instanceof Mat44, true );
                assert.equal( r.equals( s ), true );
            });
            it('should return a Vec4 when passed a Vec4 argument', function() {
                var p = Mat44.random(),
                    q = Vec4.random(),
                    r = p.mult( q ),
                    s = p.mult( new Vec4( q ) );
                assert.equal( r instanceof Vec4, true );
                assert.equal( r.equals( s ), true );
            });
            it('should return a Vec3 when passed a Vec3 argument', function() {
                var p = Mat44.random(),
                    q = Vec3.random(),
                    r = p.mult( q );
                assert.equal( r instanceof Vec3, true );
            });
            it('should return a Vec3 when passed an Array argument of length 3', function() {
                var p = Mat44.random(),
                    q = [ Math.random(), Math.random(), Math.random() ],
                    r = p.mult( q );
                assert.equal( r instanceof Vec3, true );
                assert.equal( r.equals( p.mult( new Vec3( q ) ) ), true );
            });
            it('should return a Vec4 when passed an Array argument of length 4', function() {
                var p = Mat44.random(),
                    q = [ Math.random(), Math.random(), Math.random(), Math.random() ],
                    r = p.mult( q );
                assert.equal( r instanceof Vec4, true );
                assert.equal( r.equals( p.mult( new Vec4( q ) ) ), true );
            });
            it('should return a Vec4 when passed an Array argument of length 4', function() {
                var p = Mat44.random(),
                    q = [ Math.random(), Math.random(), Math.random(), Math.random() ],
                    r = p.mult( q );
                assert.equal( r instanceof Vec4, true );
                assert.equal( r.equals( p.mult( new Vec4( q ) ) ), true );
            });
            it('should return a Mat44 when passed an Array argument of length > 4', function() {
                var p = Mat44.random(),
                    q = [ Math.random(), Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(), Math.random() ],
                    r = p.mult( q );
                assert.equal( r instanceof Mat44, true );
                assert.equal( r.equals( p.mult( new Mat44( q ) ) ), true );
            });
        });

        describe('#div()', function() {
            it('should return a Mat44 with each component divided by a scalar', function() {
                var m = Mat44.random(),
                    r = Math.random(),
                    q = m.div( r ), i;
                for ( i=0; i<16; i++ ) {
                    assert.equal( q.data[i] === m.data[i] / r, true );
                }
            });
        });

        describe('#identity()', function() {
            it('should return an identity matrix', function() {
                var p = Mat44.identity(),
                    q = new Mat44([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
                assert.equal( p.equals( q ), true );
            });
        });

        describe('#scale()', function() {
            it('should return a scale matrix', function() {
                var r = Math.random(),
                    p = Mat44.scale( r ),
                    q = new Mat44([
                        r, 0, 0, 0,
                        0, r, 0, 0,
                        0, 0, r, 0,
                        0, 0, 0, 1 ]);
                assert.equal( p.equals( q ), true );
            });
            it('should accept scalar, Vec3, and Array arguments', function() {
                var r = Math.random(),
                    p = Mat44.scale( r ),
                    q = Mat44.scale( new Vec3( r, r, r ) ),
                    s = Mat44.scale([ r, r, r ]);
                assert.equal( p.equals( q ) && p.equals( s ), true );
            });
        });

        describe('#translation()', function() {
            it('should return a translation matrix', function() {
                var r = Vec3.random(),
                    p = Mat44.translation( r ),
                    q = new Mat44([
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        r.x, r.y, r.z, 1 ]);
                assert.equal( p.equals( q ), true );
            });
            it('should accept Vec3 and Array arguments', function() {
                var r = Math.random(),
                    p = Mat44.translation( new Vec3( r, r, r ) ),
                    q = Mat44.translation([ r, r, r ]);
                assert.equal( p.equals( q ), true );
            });
        });

        describe('#rotationDegrees()', function() {
            it('should return a rotation matrix, rotating counter-clockwise', function() {
                var up = new Vec3( 0, 1, 0 ),
                    left = new Vec3( 1, 0, 0 ),
                    right = new Vec3( -1, 0, 0 ),
                    forward = new Vec3( 0, 0, 1 ),
                    up90 = Mat44.rotationDegrees( 90, up ),
                    left90 = Mat44.rotationDegrees( -90, left ),
                    forward90 = Mat44.rotationDegrees( 90, forward ),
                    v0 = up90.mult( forward ).normalize(),
                    v1 = left90.mult( forward ).normalize(),
                    v2 = forward90.mult( up ).normalize();
                assert.equal( v0.equals( left, EPSILON ), true );
                assert.equal( v1.equals( up, EPSILON ), true );
                assert.equal( v2.equals( right, EPSILON ), true );
            });
            it('should return an identity matrix if given a zero vector as an axis', function() {
                var axis = new Vec3( 0, 0, 0 ),
                    angle = Math.random();
                assert.equal( Mat44.rotationRadians( angle, axis ).equals( new Mat44() ), true );
            });
        });

        describe('#rotationRadians()', function() {
            it('should return a rotation matrix, rotating counter-clockwise', function() {
                var up = new Vec3( 0, 1, 0 ),
                    left = new Vec3( 1, 0, 0 ),
                    right = new Vec3( -1, 0, 0 ),
                    forward = new Vec3( 0, 0, 1 ),
                    up90 = Mat44.rotationRadians( 90 * Math.PI / 180, up ),
                    left90 = Mat44.rotationRadians( -90 * Math.PI / 180, left ),
                    forward90 = Mat44.rotationRadians( 90 * Math.PI / 180, forward ),
                    v0 = up90.mult( forward ).normalize(),
                    v1 = left90.mult( forward ).normalize(),
                    v2 = forward90.mult( up ).normalize();
                assert.equal( v0.equals( left, EPSILON ), true );
                assert.equal( v1.equals( up, EPSILON ), true );
                assert.equal( v2.equals( right, EPSILON ), true );
            });
            it('should return an identity matrix if given a zero vector as an axis', function() {
                var axis = new Vec3( 0, 0, 0 ),
                    angle = Math.random();
                assert.equal( Mat44.rotationRadians( angle, axis ).equals( new Mat44() ), true );
            });
        });

        describe('#rotationFromTo()', function() {
            it('should return a rotation matrix', function() {
                var r = Vec3.random().normalize(),
                    s = Vec3.random().normalize(),
                    p = Mat44.rotationFromTo( r, s ),
                    q = Mat44.rotationFromTo( s, r ),
                    a = p.mult( r ).normalize(),
                    b = q.mult( s ).normalize();
                assert.equal( a.equals( s, EPSILON ), true );
                assert.equal( b.equals( r, EPSILON ), true );
            });
        });

        describe('#ortho()', function() {
            it('should return an orthographic projection matrix', function() {
                var i = Mat44.ortho( -1, 1, -1, 1, 1, -1 ),
                    a = Mat44.ortho( -10, 5, -11, 6, 10, 500 ).mult( new Vec3( 1, 2, 3 ) ),
                    b = Mat44.ortho( -1, 23, 10, 24, -10, -200 ).mult( new Vec3( 1, 2, 3 ) );
                assert.equal( i.equals( new Mat44() ), true );
                assert.equal( a.equals( new Vec3( 0.4666666666666667, 0.5294117647058824, -1.0530612244897959 ), EPSILON ), true );
                assert.equal( b.equals( new Vec3( -0.8333333333333333, -2.142857142857143, -1.0736842105263158 ), EPSILON ), true );
            });
        });

        describe('#perspective()', function() {
            it('should return an perspective projection matrix', function() {
                var a = Mat44.perspective( 35, 3/2, 1, 500 ).mult( new Vec3( 1, 2, 3 ) ),
                    b = Mat44.perspective( 55, 2, 0.1, 10 ).mult( new Vec3( 1, 2, 3 ) );
                assert.equal( a.equals( new Vec3( 2.1143965349088085, 6.343189604726425, -5.016032064128256 ), EPSILON ), true );
                assert.equal( b.equals( new Vec3( 0.9604910634855831, 3.8419642539423324, -3.2626262626262625 ), EPSILON ), true );
            });
        });

        describe('#transpose()', function() {
            it('should return a transposed copy of the matrix', function() {
                var a = Mat44.random(),
                    b = new Mat44([
                        a.data[0], a.data[4], a.data[8], a.data[12],
                        a.data[1], a.data[5], a.data[9], a.data[13],
                        a.data[2], a.data[6], a.data[10], a.data[14],
                        a.data[3], a.data[7], a.data[11], a.data[15] ]);
                assert.equal( a.transpose().equals( b ), true );
            });

            it('should return a deep copy', function() {
                var p = Mat44.random(),
                    q = p.transpose();
                assert.equal( p !== q, true );
            });

            it('should not modify the calling object', function() {
                var p = Mat44.random(),
                    c = new Mat44( p );
                p.transpose();
                assert.equal( p.equals( c ), true );
            });
        });

        describe('#inverse()', function() {
            it('should return an inverse copy of the matrix', function() {
                var identity = Mat44.identity(),
                    a = new Mat44().inverse( Vec3.random(), Vec3.random() );
                assert.equal( a.inverse().mult( a ).equals( identity ), true );
                assert.equal( a.mult( a.inverse() ).equals( identity ), true );
            });

            it('should return a deep copy', function() {
                var p = Mat44.random(),
                    q = p.inverse();
                assert.equal( p !== q, true );
            });

            it('should not modify the calling object', function() {
                var p = Mat44.random(),
                    c = new Mat44( p );
                p.inverse();
                assert.equal( p.equals( c ), true );
            });
        });

        describe('#decompose', function() {
            it('should return the up, forward, scale, and origin components of the matrix', function() {
                var m = Mat44.random(),
                    t = new Transform( m.decompose() );
                assert.equal( m.equals( t.matrix(), EPSILON), true );
            });
        });

        describe('#toString', function() {
            it('should return a string containing the comma separated values of the transforms matrix', function() {
                var m = Mat44.random(),
                    s = m.toString().replace(/\n/g, ''),
                    a = s.split(',');

                assert.equal( parseFloat( a[0] ) === m.data[0], true );
                assert.equal( parseFloat( a[1] ) === m.data[4], true );
                assert.equal( parseFloat( a[2] ) === m.data[8], true );
                assert.equal( parseFloat( a[3] ) === m.data[12], true );

                assert.equal( parseFloat( a[4] ) === m.data[1], true );
                assert.equal( parseFloat( a[5] ) === m.data[5], true );
                assert.equal( parseFloat( a[6] ) === m.data[9], true );
                assert.equal( parseFloat( a[7] ) === m.data[13], true );

                assert.equal( parseFloat( a[8] ) === m.data[2], true );
                assert.equal( parseFloat( a[9] ) === m.data[6], true );
                assert.equal( parseFloat( a[10] ) === m.data[10], true );
                assert.equal( parseFloat( a[11] ) === m.data[14], true );

                assert.equal( parseFloat( a[12] ) === m.data[3], true );
                assert.equal( parseFloat( a[13] ) === m.data[7], true );
                assert.equal( parseFloat( a[14] ) === m.data[11], true );
                assert.equal( parseFloat( a[15] ) === m.data[15], true );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with sixteen matching components', function() {
                var m = Mat44.random(),
                    a = m.toArray(),
                    i;
                assert.equal( a instanceof Array, true );
                assert.equal( a.length === 16, true );
                for ( i=0; i<16; i++ ) {
                    assert.equal( a[i] - m.data[i] < EPSILON, true );
                }
            });
        });

    });

}());
