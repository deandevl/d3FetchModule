/**
 * Created by Rick on 2019-01-14.
 */
'use strict';
import {csv,tsv,json} from 'd3-fetch';
import {timeParse} from 'd3-time-format';

class RowConverter {
  constructor(convert){
    this.convertRow = (d) => {
      for(let obj of convert){
        if(obj.type === 'time' && obj.time_format !== undefined){
          if(d[obj.field] !== null){
            d[obj.field] = timeParse(obj.time_format)(d[obj.field]);
          }
        }else if(obj.type === 'linear'){
          if(d[obj.field] !== null) {
            d[obj.field] = +d[obj.field];
          }
        }
      }
      return d;
    }
  }
}

function read_json(datapath,convert){
  //returns a javascript Promise
  return json(datapath).then(data => {
    const converter = new RowConverter(convert);
    if(Boolean(data)) { //check undefined or null
      //data is iterable?
      if(Symbol.iterator in Object(data)){
        //data is an array
        return data.map(converter.convertRow);
      }else if(typeof data === 'object'){   //data is an object
        const convert_data = {};
        Object.entries(data).forEach(
          ([key, value]) => {
            convert_data[key] = value.map(converter.convertRow);
          }
        );
        return convert_data;
      }
    }else {
      throw 'data is null or undefined';
    }
  }).catch(e => {
    throw e;
  });
}

async function read_tsv(datapath,convert){
  const converter = new RowConverter(convert);
  //returns a javascript Promise
  try{
    return await tsv(datapath,converter.convertRow);
  }catch(e){
    throw e;
  }
}

async function read_csv(datapath,convert){
  try{
    const converter = new RowConverter(convert);
    //d3.csv returns a javascript Promise; we return a Promise as well
    return await csv(datapath,converter.convertRow);
  }catch(e){
    throw e; //generate an exception
  }
}

export{read_json,read_tsv,read_csv};