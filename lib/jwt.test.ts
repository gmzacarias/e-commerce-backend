import {expect, test} from '@jest/globals';
import { generate,decode } from './jwt';

test('jwt encode/decode', () => {
const payload = {gaston:true}
const token = generate(payload)
const salida = decode(token)
delete (salida as { iat?: any }).iat;
  
    expect(payload).toEqual(salida)
  });