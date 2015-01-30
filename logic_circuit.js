
function Connector(owner,name,activates,monitor){
	if(activates == undefined)
		activates = 0;
	if(monitor == undefined)
		monitor = 0;

	this.value = undefined;
	this.owner = owner;
	this.name = name;
	this.monitor = monitor;
	this.connects = [];
	this.activates = activates;

	this.connect = connectMethod;
	this.set = setMethod;
}

function connectMethod(inputs){
	if(!(inputs instanceof Array))
		inputs = [inputs];

	for(index in inputs)
		this.connects.push(inputs[index]);
}

function setMethod(value){
	if(this.value === value)
		return;

	this.value = value;
	if(this.activates)
		this.owner.evaluate();
	if(this.monitor)
		console.log("Connector",this.owner.name,this.name,"set to",this.value);

	for(index in this.connects)
		this.connects[index].set(value);
}


/* Class LC */
function LC(_this,name){
	_this.name = name;
	_this.evaluate = function(){
				return;
			}
}

/* Class Not */
function Not(name){				
	LC(this,name);
	this.A = new Connector(this,'A',1);

	this.B = new Connector(this,'B');

	this.evaluate = function(){
				this.B.set(!this.A.value ? 1 : 0);
			}
}

/* Class Gate2 */
function Gate2(_this,name){			
	LC(_this,name);
	_this.A = new Connector(_this,'A',1);
	_this.B = new Connector(_this,'B',1);
	_this.C = new Connector(_this,'C');
}	

/* Class And */
function And(name){				
	Gate2(this,name);
	this.evaluate = function(){
				this.C.set(this.A.value && this.B.value);
			}
}

/* Class Or */
function Or(name){				
	Gate2(this,name);
	this.evaluate = function(){
				this.C.set(this.A.value || this.B.value);
			}
}

/* Class Xor */
function Xor(name){
	Gate2(this,name);
	this.A1 = new And("A1");
	this.A2 = new And("A2");
	this.I1 = new Not("I1");
	this.I2 = new Not("I2");
	this.O1 = new Or("O1");
	this.A.connect([this.A1.A, this.I2.A]);
	this.B.connect([this.I1.A, this.A2.A]);
	this.I1.B.connect([this.A1.B ]);
	this.I2.B.connect([this.A2.B ]);
	this.A1.C.connect([this.O1.A ]);
	this.A2.C.connect([this.O1.B ]);
	this.O1.C.connect([this.C ]);
}


/* Class HalfAdder */
function HalfAdder(name){			
	LC(this, name);
	this.A = new Connector(this, 'A', 1);
	this.B = new Connector(this, 'B', 1);
	this.S = new Connector(this, 'S');
	this.C = new Connector(this,'C');
	this.X1 = new Xor("X1");
	this.A1 = new And("A1");
	this.A.connect([this.X1.A, this.A1.A]);
	this.B.connect([this.X1.B, this.A1.B]);
	this.X1.C.connect([this.S]);
	this.A1.C.connect([this.C]);
}

/* class FullAdder */
function FullAdder(name){			
	LC(this, name);
	this.A = new Connector(this, 'A', 1, 1);
	this.B = new Connector(this, 'B', 1, 1);
	this.Cin = new Connector(this, 'Cin', 1, 1);
	this.S = new Connector(this, 'S', 0, 1);
	this.Cout = new Connector(this, 'Cout', 0, 1);
	this.H1 = new HalfAdder("H1");
	this.H2 = new HalfAdder("H2");
	this.O1 = new Or("O1");
	this.A.connect([this.H1.A ]);
	this.B.connect([this.H1.B ]);
	this.Cin.connect([this.H2.A ]);
	this.H1.S.connect([this.H2.B ]);
	this.H1.C.connect([this.O1.B]);
	this.H2.C.connect([this.O1.A]);
	this.H2.S.connect([this.S]);
	this.O1.C.connect([this.Cout]);
}

function bit(x, b){
	if(x[b] === '1')
		return 1;
	else
		return 0;
}

function test4bit(a, b){			/* a, b four char strings like '0110' */
	F0 = new FullAdder("F0");
	F1 = new FullAdder("F1");
	F0.Cout.connect(F1.Cin);
	F2 = new FullAdder("F2");
	F1.Cout.connect(F2.Cin);
	F3 = new FullAdder("F3");
	F2.Cout.connect(F3.Cin);

	F0.Cin.set(0);
	F0.A.set(bit(a, 3));
	F0.B.set(bit(b, 3));			/* bits in lists are reversed from natural order */
	F1.A.set(bit(a, 2));
	F1.B.set(bit(b, 2));
	F2.A.set(bit(a, 1));
	F2.B.set(bit(b, 1));
	F3.A.set(bit(a, 0));
	F3.B.set(bit(b, 0));

	console.log(F3.Cout.value,F3.S.value,F2.S.value,F1.S.value,F0.S.value);
}






/* class Nand */
function Nand(name){				
	Gate2(this, name);
	this.evaluate = function(){
				this.C.set(!(this.A.value && this.B.value) ? 1 : 0);
			}
}

/* class Latch */
function Latch(name){
	LC(this, name);
	this.A = new Connector(this, 'A', 1);
	this.B = new Connector(this, 'B', 1);
	this.Q = new Connector(this, 'Q', 0, 1);
	this.N1 = new Nand("N1");
	this.N2 = new Nand("N2");
	this.A.connect([this.N1.A]);
	this.B.connect([this.N2.B]);
	this.N1.C.connect([this.N2.A, this.Q]);
	this.N2.C.connect([this.N1.B]);
}

function testLatch(){
	var x = new Latch("ff1");
	x.A.set(1);
	x.B.set(1);

	var input = ['A','A','B','A'];
	while(true){
		var ans = input.shift();
		if(ans != undefined)
			console.log("Input dropped :",ans);
		if(ans == undefined)
			break;
		else if(ans == 'A'){
			x.A.set(0);
			x.A.set(1);
		}
		else if(ans == 'B'){
			x.B.set(0);
			x.B.set(1);
		}
	}
}

/* class DFlipFlop */
function DFlipFlop(name){
	LC(this, name);
	this.D = new Connector(this, 'D', 1);
	this.C = new Connector(this, 'C', 1);
	this.Q = new Connector(this, 'Q');
	this.Q.value = 0;
	this.prev = undefined;

	this.evaluate = function(){
				if(this.C.value == 0 && this.prev == 1)	/* Clock drop */
					this.Q.set(this.D.value);
				this.prev = this.C.value;
			}
}

/* class Div2 */
function Div2(name){
	  LC(this, name);
	  this.C = new Connector(this,'C', 1);
	  this.D = new Connector(this,'D');
	  this.Q = new Connector(this,'Q', 0, 1);
	  this.Q.value = 0;
	  this.DFF = new DFlipFlop('DFF');
	  this.NOT = new Not('NOT');
	  this.C.connect ([this.DFF.C]);
	  this.D.connect ([this.DFF.D]);
	  this.DFF.Q.connect ([this.NOT.A,this.Q]);
	  this.NOT.B.connect ([this.DFF.D]);
	  this.DFF.Q.activates = 1;
	  this.DFF.D.value = 1 - this.DFF.Q.value;
}

function testDivBy2(){
	var x = new Div2("X");
	var c = 0;
	x.C.set(c);

	var i = 10;
	while(i--){
		 console.log("Clock is",c);
		 c = !c ? 1 : 0;
		 x.C.set(c);
	}
}

/* class Counter */
function Counter(name){
	  LC(this, name);
	  this.B0 = new Div2('B0');
	  this.B1 = new Div2('B1');
	  this.B2 = new Div2('B2');
	  this.B3 = new Div2('B3');
	  this.B0.Q.connect( this.B1.C );
	  this.B1.Q.connect( this.B2.C );
	  this.B2.Q.connect( this.B3.C );
}
	  
function testCounter(){
	var x = new Counter("x");	
	x.B0.C.set(1);			

	var i = 10;
	while(i--){
		console.log("Count is ", x.B3.Q.value, x.B2.Q.value, x.B1.Q.value, x.B0.Q.value);
		x.B0.C.set(0);	
		x.B0.C.set(1);
	}
}
