"use strict";

var EPSILON = 0.00001,
    assert = require( 'assert' ),
    Mat33 = require( '../src/Mat33' ),
    Mat44 = require( '../src/Mat44' ),
    Vec3 = require( '../src/Vec3' ),
    Vec4 = require( '../src/Vec4' ),
    Transform = require( '../src/Transform' );

describe('Mat33', function() {

    describe('#equals()', function() {
        it('should return false if any components do not match', function() {
            var i,
                a0 = Math.random(), b0 = Math.random(), c0 = Math.random(),
                a1 = Math.random(), b1 = Math.random(), c1 = Math.random(),
                a2 = Math.random(), b2 = Math.random(), c2 = Math.random(),
                p = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]),
                q;

            for ( i=0; i<p.data.length; i++ ) {
                q = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]);
                q.data[i] = q.data[i] + 1;
                assert.equal( p.equals( q ), false );
            }
        });
        it('should return true if all components match', function() {
            var a0 = Math.random(), b0 = Math.random(), c0 = Math.random(),
                a1 = Math.random(), b1 = Math.random(), c1 = Math.random(),
                a2 = Math.random(), b2 = Math.random(), c2 = Math.random(),
                p = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]),
                q = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]);

            assert.equal( p.equals( q ), true );
        });
        it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
            var r = Math.random(),
                m = new Mat33([ r, r, r,
                                r, r, r,
                                r, r, r ]);
            assert.equal( m.equals( new Mat33([ r/2, r/2, r/2,
                                                r/2, r/2, r/2,
                                                r/2, r/2, r/2 ]), r/2 ), true );
        });
    });

    describe('#random()', function() {
        it('should return a Mat33 with all random components', function() {
            var p = Mat33.random(),
                q = new Mat33([ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
            assert.equal( p.equals( q ), false );
        });
    });

    describe('#constructor()', function() {
        it('should return a deep copy when supplied another Mat33', function() {
            var p = Mat33.random(),
                q = new Mat33( p );
            assert.equal( p.equals( q ), true );
        });
        it('should return a truncated deep copy when supplied another Mat44', function() {
            var p = Mat44.random(),
                q = new Mat33( p ),
                r = new Mat33([ p.data[0], p.data[1], p.data[2],
                                p.data[4], p.data[5], p.data[6],
                                p.data[8], p.data[9], p.data[10] ]);
            assert.equal( r.equals( q ), true );
        });
        it('should return a Mat33 from an array of length 9', function() {
            var p = new Mat33( [1, 2, 3, 4, 5, 6, 7, 8, 9 ] ),
                q = new Mat33( p );
            assert.equal( p.equals( q ), true );
        });
        it('should return an identity matrix when given invalid input', function() {
            var p = new Mat33( NaN, 4 ),
                q = new Mat33( {"random":Math.random()} ),
                r = new Mat33( {} ),
                s = new Mat33( function() {
                    return false;
                }),
                t = new Mat33( [2,3,4] ),
                identity = Mat33.identity();
            assert.equal( p.equals( identity ), true );
            assert.equal( q.equals( identity ), true );
            assert.equal( r.equals( identity ), true );
            assert.equal( s.equals( identity ), true );
            assert.equal( t.equals( identity ), true );
        });
    });

    describe('#row()', function() {
        it('should return a the corresponding row, by zero based index', function() {
            var p = Mat33.random();
            assert.equal( p.row(0).equals( new Vec3( p.data[0], p.data[3], p.data[6] ) ), true );
            assert.equal( p.row(1).equals( new Vec3( p.data[1], p.data[4], p.data[7] ) ), true );
            assert.equal( p.row(2).equals( new Vec3( p.data[2], p.data[5], p.data[8] ) ), true );
        });
    });

    describe('#col()', function() {
        it('should return a the corresponding column, by zero based index', function() {
            var p = Mat33.random();
            assert.equal( p.col(0).equals( new Vec3( p.data[0], p.data[1], p.data[2] ) ), true );
            assert.equal( p.col(1).equals( new Vec3( p.data[3], p.data[4], p.data[5] ) ), true );
            assert.equal( p.col(2).equals( new Vec3( p.data[6], p.data[7], p.data[8] ) ), true );
        });
    });

    describe('#add()', function() {
        it('should return a Mat33 when passed a Mat33 argument', function() {
            var p = Mat33.random(),
                q = Mat33.random(),
                r = p.add( q );
            assert.equal( r instanceof Mat33, true );
        });
        it('should return a Mat33 when passed a Mat44 argument', function() {
            var p = Mat33.random(),
                q = Mat44.random(),
                r = p.add( q );
            assert.equal( r instanceof Mat33, true );
        });
    });

    describe('#sub()', function() {
        it('should return a Mat33 when passed a Mat33 argument', function() {
            var p = Mat33.random(),
                q = Mat33.random(),
                r = p.sub( q );
            assert.equal( r instanceof Mat33, true );
        });
        it('should return a Mat33 when passed a Mat44 argument', function() {
            var p = Mat33.random(),
                q = Mat44.random(),
                r = p.sub( q );
            assert.equal( r instanceof Mat33, true );
        });
    });

    describe('#mult()', function() {
        it('should return a Mat33 when passed a Mat33 argument', function() {
            var p = Mat33.random(),
                q = Mat33.random(),
                r = p.mult( q );
            assert.equal( r instanceof Mat33, true );
        });
        it('should return a Mat33 when passed a Mat44 argument', function() {
            var p = Mat33.random(),
                q = Mat44.random(),
                r = p.mult( q );
            assert.equal( r instanceof Mat33, true );
        });
        it('should return a Vec3 when passed a Vec4 argument', function() {
            var p = Mat33.random(),
                q = Vec4.random(),
                r = p.mult( q );
            assert.equal( r instanceof Vec3, true );
        });
        it('should return a Vec3 when passed a Vec3 argument', function() {
            var p = Mat33.random(),
                q = Vec3.random(),
                r = p.mult( q );
            assert.equal( r instanceof Vec3, true );
        });
        it('should return a Vec3 when passed an Array argument', function() {
            var p = Mat33.random(),
                q = [ Math.random(), Math.random(), Math.random() ],
                r = p.mult( q );
            assert.equal( r instanceof Vec3, true );
        });
    });

    describe('#div()', function() {
        it('should return a Mat33 with each component divided by a scalar', function() {
            var m = Mat33.random(),
                r = Math.random(),
                q = m.div( r ), i;
            for ( i=0; i<9; i++ ) {
                assert.equal( q.data[i] === m.data[i] / r, true );
            }
        });
    });

    describe('#identity()', function() {
        it('should return an identity matrix', function() {
            var p = Mat33.identity(),
                q = new Mat33([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
            assert.equal( p.equals( q ), true );
        });
    });

    describe('#scale()', function() {
        it('should return a scale matrix', function() {
            var r = Math.random(),
                p = Mat33.scale( r ),
                q = new Mat33([ r, 0, 0, 0, r, 0, 0, 0, r ]);
            assert.equal( p.equals( q ), true );
        });
        it('should accept scalar, Vec3, and Array arguments', function() {
            var r = Math.random(),
                p = Mat33.scale( r ),
                q = Mat33.scale( new Vec3( r, r, r ) ),
                s = Mat33.scale([ r, r, r ]);
            assert.equal( p.equals( q ) && p.equals( s ) , true );
        });
    });

    describe('#rotationDegrees()', function() {
        it('should return a rotation matrix, rotating counter-clockwise', function() {
            var r = Math.random(),
                up =  new Vec3( 0, 1, 0 ),
                left =  new Vec3( 1, 0, 0 ),
                right = new Vec3( -1, 0, 0 ),
                forward =  new Vec3( 0, 0, 1 ),
                up90 = Mat33.rotationDegrees( 90, up ),
                left90 = Mat33.rotationDegrees( -90, left ),
                forward90 = Mat33.rotationDegrees( 90, forward ),
                v0 = up90.mult( forward ).normalize(),
                v1 = left90.mult( forward ).normalize(),
                v2 = forward90.mult( up ).normalize();
            assert.equal( v0.equals( left, EPSILON ), true );
            assert.equal( v1.equals( up, EPSILON ), true );
            assert.equal( v2.equals( right, EPSILON ), true );
        });
        it('should accept both Vec3 and Array types as axis', function() {
            var r = Math.random(),
                v = Vec3.random(),
                rot0 = Mat33.rotationDegrees( r, v ),
                rot1 = Mat33.rotationDegrees( r, [ v.x, v.y, v.z ] );
            assert.equal( rot0.equals( rot1, EPSILON ), true );
        });
        it('should return an identity matrix if given a zero vector as an axis', function() {
            var axis = new Vec3( 0, 0, 0 ),
                angle = Math.random();
            assert.equal( Mat33.rotationDegrees( angle, axis ).equals( Mat33() ), true );
        });
    });

    describe('#rotationRadians()', function() {
        it('should return a rotation matrix, rotating counter-clockwise', function() {
            var r = Math.random(),
                up =  new Vec3( 0, 1, 0 ),
                left =  new Vec3( 1, 0, 0 ),
                right = new Vec3( -1, 0, 0 ),
                forward =  new Vec3( 0, 0, 1 ),
                up90 = Mat33.rotationRadians( 90 * Math.PI / 180, up ),
                left90 = Mat33.rotationRadians( -90 * Math.PI / 180, left ),
                forward90 = Mat33.rotationRadians( 90 * Math.PI / 180, forward ),
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
            assert.equal( Mat33.rotationRadians( angle, axis ).equals( Mat33() ), true );
        });
    });

    describe('#rotationFromTo()', function() {
        it('should return a rotation matrix from vector A to B', function() {
            var r = Vec3.random().normalize(),
                s = Vec3.random().normalize(),
                rs = Mat33.rotationFromTo( r, s ).mult( r ).normalize(),
                sr = Mat33.rotationFromTo( s, r ).mult( s ).normalize(),
                v = Vec3.random().add( new Vec3( 1, 1, 1) ).normalize(),
                ca = new Vec3( 0, 1, 1).normalize(),
                cb = new Vec3( 0, 1, 0 ).normalize(),
                cc = new Vec3( 1, 0, -1 ).normalize(),
                cd = new Vec3( 1, 0, 0 ).normalize(),
                other;

            assert.equal( rs.equals( s, EPSILON ), true );
            assert.equal( sr.equals( r, EPSILON ), true );

            other = Mat33.rotationDegrees( 0.0001, v ).mult( ca ).normalize();
            assert.equal( Mat33.rotationFromTo( ca, other ).mult( ca ).equals( other, EPSILON ), true );

            other = Mat33.rotationDegrees( 0.0001, v ).mult( cb ).normalize();
            assert.equal( Mat33.rotationFromTo( cb, other ).mult( cb ).equals( other, EPSILON ), true );

            other = Mat33.rotationDegrees( 0.0001, v ).mult( cc ).normalize();
            assert.equal( Mat33.rotationFromTo( cc, other ).mult( cc ).equals( other, EPSILON ), true );

            other = Mat33.rotationDegrees( 0.0001, v ).mult( cd ).normalize();
            assert.equal( Mat33.rotationFromTo( cd, other ).mult( cd ).equals( other, EPSILON ), true );
        });
    });

    describe('#transpose()', function() {
        it('should return a transposed copy of the matrix', function() {
            var a = Mat33.random(),
                b = new Mat33([ a.data[0], a.data[3], a.data[6],
                                a.data[1], a.data[4], a.data[7],
                                a.data[2], a.data[5] ,a.data[8] ]);
            assert.equal( a.transpose().equals( b ), true );
        });

        it('should return a deep copy', function() {
            var p = Mat33.random(),
                q = p.transpose();
            assert.equal( p !== q, true );
        });

        it('should not modify the calling object', function() {
            var p = Mat33.random(),
                c = new Mat33( p ),
                q = p.transpose();
            assert.equal( p.equals( c ), true );
        });
    });

    describe('#inverse()', function() {
        it('should return an inverse copy of the matrix', function() {
            var identity = Mat33.identity(),
                a = new Mat33().inverse( Vec3.random(), Vec3.random() );

            assert.equal( a.inverse().mult( a ).equals( identity ), true );
            assert.equal( a.mult( a.inverse() ).equals( identity ), true );
        });

        it('should return a deep copy', function() {
            var p = Mat33.random(),
                q = p.inverse();
            assert.equal( p !== q, true );
        });

        it('should not modify the calling object', function() {
            var p = Mat33.random(),
                c = new Mat33( p ),
                q = p.inverse();
            assert.equal( p.equals( c ), true );
        });
    });

    describe('#decompose', function() {
        it('should return the up, forward, scale, and origin components of the matrix', function() {
            var m = Mat33.random(),
                t = new Transform( m.decompose() );
            assert.equal( m.equals( new Mat33( t.matrix() ), EPSILON), true );
        });
    });

    describe('#toString', function() {
        it('should return a string containing the comma separated values of the transforms matrix', function() {
            var m = Mat33.random(),
                s = m.toString().replace(/\n/g, ''),
                a = s.split(',');

            assert.equal( parseFloat( a[0] ) === m.data[0], true );
            assert.equal( parseFloat( a[1] ) === m.data[3], true );
            assert.equal( parseFloat( a[2] ) === m.data[6], true );

            assert.equal( parseFloat( a[3] ) === m.data[1], true );
            assert.equal( parseFloat( a[4] ) === m.data[4], true );
            assert.equal( parseFloat( a[5] ) === m.data[7], true );

            assert.equal( parseFloat( a[6] ) === m.data[2], true );
            assert.equal( parseFloat( a[7] ) === m.data[5], true );
            assert.equal( parseFloat( a[8] ) === m.data[8], true );
        });
    });

    describe('#toArray', function() {
        it('should return an Array with nine matching components', function() {
            var m = Mat33.random(),
                a = m.toArray(),
                i;
            assert.equal( a instanceof Array, true );
            assert.equal( a.length === 9, true );
            for ( i=0; i<9; i++ ) {
                assert.equal( a[i] - m.data[i] < EPSILON, true );
            }
        });
    });

});
