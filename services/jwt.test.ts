import {expect, test} from '@jest/globals';
import { generateToken,decodeToken } from 'services/jwt';

test('jwt encode/decode', () => {
const payload = {gaston:true}
const token = generateToken(payload)
const salida = decodeToken(token as string)
delete (salida as { iat?: any }).iat;
  
    expect(payload).toEqual(salida)
  });