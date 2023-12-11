pragma circom 2.0.0;


template server_verify () {  

   // Declaration of signals.  
   signal input in;  
   signal output req;  

   // Constraints.  
   req <== in;  
}

component main = server_verify();