import { sigil, reactRenderer } from './sigil-ts';
import { isValidPatp } from '../logic/ob/co';
import comet from '../assets/icons/comet.svg';
import { auraToHex } from '../logic/utils';

interface SigilProps {
  patp: string;
  size: number;
  color?: string;
}

const Sigil = (props: SigilProps) => {
  const color = props.color ? auraToHex(props.color) : 'black';
  if (!isValidPatp(props.patp)) return <div className="sigil bad-sigil">X</div>;
  else if (props.patp.length > 28)
    return (
      <img
        className="comet-icon"
        src={comet}
        alt=""
        style={{ width: `${props.size}px`, height: `${props.size}px` }}
      />
    );
  else if (props.patp.length > 15)
    // moons
    return (
      <>
        {sigil({
          patp: props.patp.substring(props.patp.length - 13),
          renderer: reactRenderer,
          size: props.size,
          colors: ['grey', 'white'],
        })}
      </>
    );
  else
    return (
      <>
        {sigil({
          patp: props.patp,
          renderer: reactRenderer,
          size: props.size,
          colors: [color, 'white'],
        })}
      </>
    );
};

export default Sigil;
