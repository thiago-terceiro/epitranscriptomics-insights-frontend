import { isAlphaFoldDemoEnabled } from "@/lib/server/runtime";

const DEMO_PDB = `HEADER    DEMO AF3 STRUCTURE
TITLE     POLY-ALANINE BACKBONE FOR VISUALISATION
MODEL        1
ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00 20.00           N
ATOM      2  CA  ALA A   1       1.500   0.300   1.200  1.00 20.00           C
ATOM      3  C   ALA A   1       2.800   1.000   2.300  1.00 20.00           C
ATOM      4  O   ALA A   1       2.700   2.200   3.100  1.00 20.00           O
ATOM      5  N   ALA A   2       0.000   0.000   3.800  1.00 20.00           N
ATOM      6  CA  ALA A   2       1.500   0.300   5.000  1.00 20.00           C
ATOM      7  C   ALA A   2       2.800   1.000   6.100  1.00 20.00           C
ATOM      8  O   ALA A   2       2.700   2.200   6.900  1.00 20.00           O
ATOM      9  N   ALA A   3       0.000   0.000   7.600  1.00 20.00           N
ATOM     10  CA  ALA A   3       1.500   0.300   8.800  1.00 20.00           C
ATOM     11  C   ALA A   3       2.800   1.000   9.900  1.00 20.00           C
ATOM     12  O   ALA A   3       2.700   2.200  10.700  1.00 20.00           O
ATOM     13  N   ALA A   4       0.000   0.000  11.400  1.00 20.00           N
ATOM     14  CA  ALA A   4       1.500   0.300  12.600  1.00 20.00           C
ATOM     15  C   ALA A   4       2.800   1.000  13.700  1.00 20.00           C
ATOM     16  O   ALA A   4       2.700   2.200  14.500  1.00 20.00           O
ATOM     17  N   ALA A   5       0.000   0.000  15.200  1.00 20.00           N
ATOM     18  CA  ALA A   5       1.500   0.300  16.400  1.00 20.00           C
ATOM     19  C   ALA A   5       2.800   1.000  17.500  1.00 20.00           C
ATOM     20  O   ALA A   5       2.700   2.200  18.300  1.00 20.00           O
ATOM     21  N   ALA A   6       0.000   0.000  19.000  1.00 20.00           N
ATOM     22  CA  ALA A   6       1.500   0.300  20.200  1.00 20.00           C
ATOM     23  C   ALA A   6       2.800   1.000  21.300  1.00 20.00           C
ATOM     24  O   ALA A   6       2.700   2.200  22.100  1.00 20.00           O
ATOM     25  N   ALA A   7       0.000   0.000  22.800  1.00 20.00           N
ATOM     26  CA  ALA A   7       1.500   0.300  24.000  1.00 20.00           C
ATOM     27  C   ALA A   7       2.800   1.000  25.100  1.00 20.00           C
ATOM     28  O   ALA A   7       2.700   2.200  25.900  1.00 20.00           O
ATOM     29  N   ALA A   8       0.000   0.000  26.600  1.00 20.00           N
ATOM     30  CA  ALA A   8       1.500   0.300  27.800  1.00 20.00           C
ATOM     31  C   ALA A   8       2.800   1.000  28.900  1.00 20.00           C
ATOM     32  O   ALA A   8       2.700   2.200  29.700  1.00 20.00           O
ATOM     33  N   ALA A   9       0.000   0.000  30.400  1.00 20.00           N
ATOM     34  CA  ALA A   9       1.500   0.300  31.600  1.00 20.00           C
ATOM     35  C   ALA A   9       2.800   1.000  32.700  1.00 20.00           C
ATOM     36  O   ALA A   9       2.700   2.200  33.500  1.00 20.00           O
ATOM     37  N   ALA A  10       0.000   0.000  34.200  1.00 20.00           N
ATOM     38  CA  ALA A  10       1.500   0.300  35.400  1.00 20.00           C
ATOM     39  C   ALA A  10       2.800   1.000  36.500  1.00 20.00           C
ATOM     40  O   ALA A  10       2.700   2.200  37.300  1.00 20.00           O
ATOM     41  N   ALA A  11       0.000   0.000  38.000  1.00 20.00           N
ATOM     42  CA  ALA A  11       1.500   0.300  39.200  1.00 20.00           C
ATOM     43  C   ALA A  11       2.800   1.000  40.300  1.00 20.00           C
ATOM     44  O   ALA A  11       2.700   2.200  41.100  1.00 20.00           O
ATOM     45  N   ALA A  12       0.000   0.000  41.800  1.00 20.00           N
ATOM     46  CA  ALA A  12       1.500   0.300  43.000  1.00 20.00           C
ATOM     47  C   ALA A  12       2.800   1.000  44.100  1.00 20.00           C
ATOM     48  O   ALA A  12       2.700   2.200  44.900  1.00 20.00           O
TER
END
`;

export async function GET() {
    if (!isAlphaFoldDemoEnabled()) {
        return new Response("Not found", { status: 404 });
    }

    return new Response(DEMO_PDB, {
        status: 200,
        headers: {
            "Content-Type": "chemical/x-pdb; charset=utf-8",
            "Cache-Control": "public, max-age=300",
        },
    });
}
