const jwt=require('jsonwebtoken');const bcrypt=require('bcryptjs');
function sign(user){return jwt.sign({id:user.id,email:user.email,role:user.role},process.env.JWT_SECRET||'dev-secret-change-me',{expiresIn:'8h'});} 
function auth(req,res,next){try{const h=req.headers.authorization||'';if(!h.startsWith('Bearer ')) return res.status(401).json({success:false,message:'Authentication token required'});req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET||'dev-secret-change-me');next();}catch(e){return res.status(401).json({success:false,message:'Session expired or invalid'});}}
function role(...roles){return (req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({success:false,message:'Forbidden'});}
module.exports={sign,auth,role,bcrypt};