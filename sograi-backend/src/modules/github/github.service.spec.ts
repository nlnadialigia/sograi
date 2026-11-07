import { GitHubService } from './github.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;
  let mockSettingsService: any;

  beforeEach(() => {
    mockSettingsService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'GITHUB_DEFAULT_ORG') return Promise.resolve('nlnadialigia');
        if (key === 'GITHUB_TOKEN') return Promise.resolve('ghp_testtoken');
        return Promise.resolve(null);
      }),
    };
    service = new GitHubService(mockSettingsService);
  });

  it('deve criar uma issue com sucesso chamando a API do GitHub com headers e payload esperados', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 999,
        number: 42,
        html_url: 'https://github.com/nlnadialigia/sograi/issues/42',
        title: 'Nova Feature Sugerida',
        state: 'open',
      },
    });

    const result = await service.createIssue({
      title: 'Nova Feature Sugerida',
      body: 'Detalhamento da feature',
      labels: ['enhancement'],
    });

    expect(result).toEqual({
      id: 999,
      number: 42,
      htmlUrl: 'https://github.com/nlnadialigia/sograi/issues/42',
      title: 'Nova Feature Sugerida',
      state: 'open',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.github.com/repos/nlnadialigia/sograi/issues',
      {
        title: 'Nova Feature Sugerida',
        body: 'Detalhamento da feature',
        labels: ['enhancement'],
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer ghp_testtoken',
        }),
      })
    );
  });

  it('deve capturar e propagar erro formatado quando a API do GitHub falhar', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Bad credentials' } },
    });

    await expect(
      service.createIssue({
        title: 'Teste',
        body: 'Desc',
      })
    ).rejects.toThrow('Falha ao criar issue no GitHub: Bad credentials');
  });
});
